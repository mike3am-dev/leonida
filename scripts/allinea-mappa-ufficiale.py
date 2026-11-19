"""Allinea la mappa ufficiale di Rockstar («The Great State of Leonida», file mappa-ufficiale.jpg alla radice del repo,
messo da Mike il 19/11) con la base della mappa del gioco (docs/assets/img/mappa/leonida-giorno.jpg), confrontando le coste.
Prima: convertire la mappa CMYK in RGB con il suo profilo colore (uff-rgb.png). Serve opencv-python-headless.
Il risultato (la trasformazione g2u e la cornice della griglia) è in scripts/mappa-ufficiale-griglia.json ed è copiato
in docs/js/views/mapboard.js (G2U, FRAME). La base «Mappa ufficiale» (leonida-ufficiale.webp) è la mappa riproiettata
nei pixel della base del gioco (2896×3700), così i punti cadono negli stessi posti senza cambiare il codice."""
import cv2, numpy as np, json
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
U=np.array(Image.open('uff-rgb.png').convert('RGB'))
G=np.array(Image.open('/home/user/leonida/docs/assets/img/mappa/leonida-giorno.jpg').convert('RGB'))
def landmask(a):
    hsv=cv2.cvtColor(a,cv2.COLOR_RGB2HSV)
    h,s,v=hsv[...,0].astype(int),hsv[...,1].astype(int),hsv[...,2].astype(int)
    water=(h>=85)&(h<=125)&(s>70)
    m=(~water).astype(np.uint8)*255
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    return m
k=0.15
Us=cv2.resize(U,None,fx=k,fy=k,interpolation=cv2.INTER_AREA); Gs=cv2.resize(G,None,fx=k*2.8,fy=k*2.8,interpolation=cv2.INTER_AREA)
mu=landmask(Us); mg=landmask(Gs)
# niente cornice: dalla mappa ufficiale tengo solo l'interno del riquadro (tolgo il 4% ai bordi), legenda e stemma restano terra: li tolgo
H,W=mu.shape; mu[:int(H*.04)]=0; mu[-int(H*.04):]=0; mu[:,:int(W*.04)]=0; mu[:,-int(W*.04):]=0
mu[int(H*.04):int(H*.20), int(W*.06):int(W*.24)]=0   # legenda
mu[int(H*.77):int(H*.95), int(W*.68):int(W*.92)]=0   # stemma e titolo
cv2.imwrite('mu.png',mu); cv2.imwrite('mg.png',mg)
def bbox(m):
    ys,xs=np.nonzero(m); 
    # ritaglio robusto: percentili
    return np.percentile(xs,1),np.percentile(ys,1),np.percentile(xs,99),np.percentile(ys,99)
bu=bbox(mu); bg=bbox(mg); print('bbox u',bu,'g',bg)
sx=(bu[2]-bu[0])/(bg[2]-bg[0]); sy=(bu[3]-bu[1])/(bg[3]-bg[1])
warp=np.array([[1/sx,0,bg[0]-bu[0]/sx],[0,1/sy,bg[1]-bu[1]/sy]],np.float32)   # u -> g (ECC: template=ufficiale, input=giorno)
crit=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,500,1e-6)
gb=cv2.GaussianBlur(mg.astype(np.float32)/255,(0,0),3); ub=cv2.GaussianBlur(mu.astype(np.float32)/255,(0,0),3)
cc,warp=cv2.findTransformECC(ub,gb,warp,cv2.MOTION_AFFINE,crit,None,5)
print('ecc',cc); print(warp)
M=np.vstack([warp,[0,0,1]]); Minv=np.linalg.inv(M)[:2]          # g -> u, nelle immagini piccole
kg=k*2.8
S_g=np.diag([kg,kg,1]); S_u_inv=np.diag([1/k,1/k,1])
full=(S_u_inv@np.vstack([Minv,[0,0,1]])@S_g)[:2]
print('full g->u', full)
json.dump({'g2u':full.tolist(),'ecc':float(cc)},open('reg.json','w'))
warp_gu=Minv.astype(np.float32)
# controllo visivo: sovrappongo i contorni
out=Us.copy(); mgw=cv2.warpAffine(mg,warp_gu,(Us.shape[1],Us.shape[0]))
cnt,_=cv2.findContours(mgw,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE); cv2.drawContours(out,cnt,-1,(255,0,0),2)
Image.fromarray(out).save('overlay.jpg',quality=85)

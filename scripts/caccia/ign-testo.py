import re,html,glob,os,sys,json
base=sys.argv[1]
os.makedirs(base+'/t2',exist_ok=True)
def render(b):
    b=re.sub(r'<span class="inline-spoiler"[^>]*>(.*?)</span>',r'[[\1]]',b,flags=re.S)
    b=re.sub(r'<span data-transform="button-prompt"[^>]*data-platform="ps"[^>]*data-button="([^"]*)"[^>]*>.*?</span>',r'{\1}',b,flags=re.S)
    b=re.sub(r'<span data-transform="button-prompt"[^>]*data-platform="(xbox|pc)"[^>]*>.*?</span>','',b,flags=re.S)
    b=re.sub(r'<img [^>]*>','',b)
    b=re.sub(r'<(h[1-6])[^>]*>','\n## ',b)
    b=re.sub(r'<li[^>]*>','\n- ',b)
    b=re.sub(r'</t[dh]>',' | ',b)
    b=re.sub(r'<(p|tr|br|div)[^>]*>','\n',b)
    b=html.unescape(re.sub(r'<[^>]+>','',b))
    b=re.sub(r'[ \t]+',' ',b); b=re.sub(r'\n\s*\n+','\n',b)
    return b
for f in sorted(glob.glob(base+'/raw/*.html')):
    t=open(f,errors='ignore').read()
    m=re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',t,re.S)
    if not m: continue
    d=json.loads(m.group(1))
    try: p=d['props']['pageProps']['page']['page']
    except Exception: continue
    if not p or not p.get('htmlEntities'): continue
    out=[f"{p.get('updatedAt','?')[:16]} https://www.ign.com/wikis/gta-6/{os.path.basename(f)[:-5]}\n# {p.get('title')}"]
    for e in p['htmlEntities']:
        v=e.get('values') or {}
        if 'html' in v: out.append(render(v['html']).strip())
        else: out.append('<<'+e.get('name','?')+' '+json.dumps(v)[:200]+'>>')
    n=os.path.basename(f)[:-5]
    s='\n'.join(x for x in out if x)
    open(base+'/t2/'+n+'.txt','w').write(s)

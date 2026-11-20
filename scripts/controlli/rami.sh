#!/bin/sh
# Uso: sh scripts/controlli/rami.sh
# Elenca TUTTI i rami su GitHub che hanno lavoro non ancora su origin/sviluppo
# (per esempio una chat Grafica che aspetta l'OK di Mike sul suo ramo di sessione).
# La chat Pubblicazione lo lancia prima del riepilogo e di nuovo prima di pubblicare.
git fetch -q origin '+refs/heads/*:refs/remotes/origin/*' || exit 1
trovati=0
for b in $(git branch -r --format='%(refname:short)' | grep -v -e HEAD -e '^origin/backup-' -e '^origin/main$' -e '^origin/sviluppo$'); do
  n=$(git rev-list --count origin/sviluppo.."$b")
  [ "$n" -gt 0 ] || continue
  trovati=1
  echo "== $b · $n commit non su sviluppo · ultimo: $(git log -1 --format='%cd' --date=format:'%d/%m %H:%M' "$b")"
  git log --format='   - %s' origin/sviluppo.."$b" --no-merges | head -8
  git diff --stat origin/sviluppo..."$b" | tail -1 | sed 's/^/   /'
done
[ $trovati = 0 ] && echo "Nessun ramo con lavoro fuori da sviluppo."
exit 0

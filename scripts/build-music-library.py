"""Generate the public playlist and direct-file HTML fallback from uploaded audio."""
import argparse,json,re
from pathlib import Path
from urllib.parse import quote
parser=argparse.ArgumentParser();parser.add_argument('--dist',type=Path,default=Path(__file__).resolve().parents[1]/'dist');args=parser.parse_args()
folder=args.dist/'assets/music';folder.mkdir(parents=True,exist_ok=True)
tracks=[]
for p in sorted(folder.iterdir(),key=lambda p:p.name.casefold()):
 if not p.is_file() or p.suffix.lower() not in {'.mp3','.m4a','.aac','.ogg','.wav','.flac'}:continue
 artist,name=(p.stem.split(' - ',1) if ' - ' in p.stem else ('我的歌单',p.stem))
 tracks.append({'name':name,'artist':artist,'url':'assets/music/'+quote(p.name,safe=''),'cover':'assets/music/cover.svg','id':p.name})
library={'tracks':tracks};encoded=json.dumps(library,ensure_ascii=False,indent=2)
(folder/'library.json').write_text(encoded+'\n')
for filename in ['index.html','works.html','works-local-preview.html','music.html']:
 p=args.dist/filename
 if not p.exists():continue
 s=p.read_text();s=re.sub(r'<script id="music-library" type="application/json">[\s\S]*?</script>\s*','',s)
 s=s.replace('</body>','<script id="music-library" type="application/json">'+encoded.replace('<','\\u003c')+'</script>\n</body>');p.write_text(s)
print(f'Built music library: {len(tracks)} tracks')

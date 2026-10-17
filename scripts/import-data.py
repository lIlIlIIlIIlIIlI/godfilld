"""Import numeric/mechanical reference data, never original names or client assets."""
import csv,json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=root.parent/'reference/godfield-flash/server-src'
keys=['type','attackKind','attackExtra','defenseKind','defenseExtra','attribute','value','subValue','hitRate','price','weight']
rows=[]
for i,row in enumerate(csv.reader((source/'ItemData.CSV').open())):
    card={'id':i, **dict(zip(keys,row))}
    for key in keys[6:]:card[key]=int(card[key] or 0)
    rows.append(card)
assistant=[]
for i,row in enumerate(csv.reader((source/'AssistantItemData.CSV').open())):
    card=dict(zip(['assistantType','attackKind','attackExtra','attribute','value','hitRate','weight'],row))
    for key in ['value','hitRate','weight']:card[key]=int(card[key] or 0)
    card['id']=i
    assistant.append(card)
(root/'data/cards.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
(root/'data/summons.json').write_text(json.dumps(assistant,ensure_ascii=False,indent=2))
(root/'data/provenance.json').write_text(json.dumps({'repository':'https://github.com/Igoorx/godfield-flash','commit':'fcc83740a3d3cd9968e6e5cd2b7ed781f53abe80','license':'AGPL-3.0-only','files':{p:hashlib.sha256((source/p).read_bytes()).hexdigest() for p in ['ItemData.CSV','AssistantItemData.CSV']}},indent=2))
print(f'Imported {len(rows)} cards and {len(assistant)} summon actions; {sum(c["weight"]>0 for c in rows)} drawable.')

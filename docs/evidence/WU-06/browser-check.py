import asyncio,json,urllib.request,base64,pathlib
import websockets
root=pathlib.Path(__file__).resolve().parents[3]
async def main():
 targets=json.load(urllib.request.urlopen('http://127.0.0.1:9222/json'))
 async with websockets.connect(targets[0]['webSocketDebuggerUrl'],origin='http://localhost:9222') as ws:
  counter=0
  async def call(method,params={}):
   nonlocal counter
   counter+=1;n=counter
   await ws.send(json.dumps({'id':n,'method':method,'params':params}))
   while True:
    r=json.loads(await ws.recv())
    if r.get('id')==n:return r.get('result',r)
  async def evaluate(expression):return (await call('Runtime.evaluate',{'expression':expression,'returnByValue':True}))['result'].get('value')
  await call('Page.enable')
  results=[]
  for width,height,path,name in [(1280,1000,'/demo','dashboard-desktop'),(390,844,'/demo','dashboard-mobile'),(768,1024,'/import','import-tablet'),(1280,1000,'/issues','issues-desktop')]:
   await call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':1,'mobile':width<500})
   await call('Page.navigate',{'url':'http://127.0.0.1:3000'+path})
   for _ in range(40):
    await asyncio.sleep(.1)
    if await evaluate('document.readyState')=='complete':break
   await asyncio.sleep(.3)
   if path=='/issues':
    link=await evaluate("Array.from(document.querySelectorAll('article')).find(x=>x.innerText.includes('SO-001 may miss its deadline')).querySelector('a').href")
    await call('Page.navigate',{'url':link});await asyncio.sleep(.6)
   check=await evaluate("({title:document.title,heading:document.querySelector('h1')?.innerText,width:innerWidth,scroll:document.documentElement.scrollWidth,text:document.body.innerText,unlabelled:Array.from(document.querySelectorAll('input,select,textarea')).filter(x=>!x.labels?.length&&!x.getAttribute('aria-label')).length})")
   if path=='/issues':
    assert check['heading']=='SO-001 may miss its deadline',check
    assert all(x in check['text'] for x in ['30%', '200 pcs', '2 days', 'AI analysis']),check
   check['screenshot']=name+'.png';check['path']=path
   snap=await call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})
   (root/'docs/evidence/WU-06'/check['screenshot']).write_bytes(base64.b64decode(snap['data']))
   assert check['scroll']<=check['width'],check
   assert check['unlabelled']==0,check
   results.append(check)
  await call('Page.navigate',{'url':'http://127.0.0.1:3000/import'})
  await asyncio.sleep(.5)
  doc=await call('DOM.getDocument')
  node=await call('DOM.querySelector',{'nodeId':doc['root']['nodeId'],'selector':'input[type=file]'})
  await call('DOM.setFileInputFiles',{'nodeId':node['nodeId'],'files':[str(root/'tests/fixtures/imports/orders.csv')]})
  await evaluate("Array.from(document.querySelectorAll('button')).find(x=>x.innerText==='Import Preview').click()")
  for _ in range(50):
   await asyncio.sleep(.1)
   if await evaluate("document.body.innerText.includes('Review Mapping')"):break
  assert await evaluate("document.body.innerText.includes('Review Mapping')")
  await evaluate("(()=>{const s=document.querySelector('#default-unit');s.value='pcs';s.dispatchEvent(new Event('change',{bubbles:true}));})()")
  await asyncio.sleep(.1)
  await evaluate("document.querySelector('input[type=checkbox]').click()")
  await asyncio.sleep(.1)
  await evaluate("Array.from(document.querySelectorAll('button')).find(x=>x.innerText==='Confirm Mapping and Check Data').click()")
  for _ in range(50):
   await asyncio.sleep(.1)
   if await evaluate("document.body.innerText.includes('Data Health')"):break
  health=await evaluate('document.body.innerText')
  assert 'Data Health' in health and 'rows ready' in health,health
  (root/'docs/evidence/WU-06/production-import.txt').write_text(health)
  snap=await call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})
  (root/'docs/evidence/WU-06/import-health-desktop.png').write_bytes(base64.b64decode(snap['data']))
  routes=[]
  for p in ['/','/data','/demo','/issues','/actions','/activity','/import']:
   r=urllib.request.urlopen('http://127.0.0.1:3000'+p);routes.append({'route':p,'status':r.status})
  (root/'docs/evidence/WU-06/browser-checks.json').write_text(json.dumps({'browser':results,'http':routes},indent=2))
  print(json.dumps({'screens':[{'path':x['path'],'heading':x['heading'],'width':x['width'],'scroll':x['scroll'],'unlabelled':x['unlabelled']} for x in results],'http':routes},indent=2))
asyncio.run(main())

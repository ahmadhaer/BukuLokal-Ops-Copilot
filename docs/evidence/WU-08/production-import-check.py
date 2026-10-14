"""Actual Next production Server Actions: preview/health works; unconfigured save is disabled."""
import asyncio,base64,json,pathlib,urllib.request
import websockets
ROOT=pathlib.Path(__file__).resolve().parents[3]
async def main():
    targets=json.load(urllib.request.urlopen('http://127.0.0.1:9222/json'))
    async with websockets.connect(targets[0]['webSocketDebuggerUrl'],origin='http://localhost:9222') as ws:
        number=0
        async def call(method,params=None):
            nonlocal number
            number+=1;await ws.send(json.dumps({'id':number,'method':method,'params':params or {}}))
            while True:
                response=json.loads(await ws.recv())
                if response.get('id')==number:return response.get('result',response)
        async def evaluate(expression):return (await call('Runtime.evaluate',{'expression':expression,'returnByValue':True}))['result'].get('value')
        async def wait(expression):
            for _ in range(100):
                if await evaluate(expression):return
                await asyncio.sleep(.1)
            raise AssertionError(await evaluate('document.body.innerText'))
        await call('Page.navigate',{'url':'http://127.0.0.1:3003/import'})
        await wait("document.querySelector('input[type=file]')!==null")
        await wait("document.body.innerText.includes('Workspace storage is not configured')")
        doc=await call('DOM.getDocument');node=await call('DOM.querySelector',{'nodeId':doc['root']['nodeId'],'selector':'input[type=file]'})
        await call('DOM.setFileInputFiles',{'nodeId':node['nodeId'],'files':[str(ROOT/'tests/fixtures/imports/invalid-orders.csv')]})
        await wait("Array.from(document.querySelectorAll('button')).find(x=>x.innerText==='Import Preview')?.disabled===false")
        await evaluate("Array.from(document.querySelectorAll('button')).find(x=>x.innerText==='Import Preview').click()")
        await wait("document.body.innerText.includes('Review Mapping')")
        await evaluate("document.querySelector('input[type=checkbox]').click()")
        await evaluate("Array.from(document.querySelectorAll('button')).find(x=>x.innerText==='Confirm Mapping and Check Data').click()")
        await wait("document.body.innerText.includes('Data Health')")
        text=await evaluate('document.body.innerText');assert '1 rows ready' in text and '6 rows need attention' in text
        disabled=await evaluate("Array.from(document.querySelectorAll('button')).find(x=>x.innerText==='Save Valid Data').disabled")
        assert disabled and 'saving is unavailable' in text
        screenshot=await call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})
        (ROOT/'docs/evidence/WU-08/production-import-unavailable.png').write_bytes(base64.b64decode(screenshot['data']))
        (ROOT/'docs/evidence/WU-08/production-import-checks.json').write_text(json.dumps({'data_health':text,'save_disabled':disabled,'records_written':0,'composition':'actual Next production, missing storage configuration'},indent=2))
        print('Production import preview/health/unavailable-save: PASS')
asyncio.run(main())

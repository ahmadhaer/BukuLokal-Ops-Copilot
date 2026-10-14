"""Existing Chromium/CDP: isolated full test composition plus real production config checks."""
import asyncio,base64,json,pathlib,time,urllib.request
import websockets
ROOT=pathlib.Path(__file__).resolve().parents[3]
async def main():
    targets=json.load(urllib.request.urlopen('http://127.0.0.1:9222/json'))
    async with websockets.connect(targets[0]['webSocketDebuggerUrl'],origin='http://localhost:9222') as ws:
        counter=0
        async def call(method,params=None):
            nonlocal counter
            counter+=1
            await ws.send(json.dumps({'id':counter,'method':method,'params':params or {}}))
            while True:
                result=json.loads(await ws.recv())
                if result.get('id')==counter:return result.get('result',result)
        async def evaluate(expression):
            result=await call('Runtime.evaluate',{'expression':expression,'returnByValue':True})
            if 'exceptionDetails' in result:raise AssertionError(result['exceptionDetails'].get('text'))
            return result['result'].get('value')
        async def wait(expression):
            for _ in range(150):
                if await evaluate(expression):return
                await asyncio.sleep(.1)
            raise AssertionError(await evaluate('document.body.innerText'))
        async def click(label,kind='button'):
            await evaluate(f"Array.from(document.querySelectorAll('{kind}')).find(x=>x.innerText==={json.dumps(label)}).click()")
        async def shot(name):
            size=await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
            assert size['scroll']<=size['width'],size
            result=await call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})
            (ROOT/'docs/evidence/WU-08'/name).write_bytes(base64.b64decode(result['data']))
        await call('Page.enable')
        await call('Emulation.setDeviceMetricsOverride',{'width':1280,'height':1100,'deviceScaleFactor':1,'mobile':False})
        await call('Page.navigate',{'url':'http://127.0.0.1:4173/'})
        await wait("document.querySelector('h1')?.innerText==='BukuLokal Ops Copilot'")
        start=time.perf_counter()
        await click('Try Demo','a')
        await wait("document.querySelector('h1')?.innerText==='Operations overview'")
        dashboard=await evaluate('document.body.innerText')
        await evaluate("Array.from(document.querySelectorAll('article')).find(x=>x.innerText.includes('SO-001 may miss its deadline')).querySelector('a').click()")
        await wait("document.querySelector('h1')?.innerText==='SO-001 may miss its deadline'")
        evidence=await evaluate('document.body.innerText')
        assert all(x in evidence for x in ['Critical','30%','350 pcs','200 pcs','2 days'])
        assert not await evaluate("document.body.innerText.includes('Synthetic order needs operational review.')"), 'Start the test harness with fresh test state.'
        await click('Analyze with AI')
        await wait("document.body.innerText.includes('Synthetic order needs operational review.')")
        elapsed=time.perf_counter()-start
        assert elapsed<=120
        await wait("document.body.innerText.toLowerCase().includes('suggested')")
        await shot('golden-ai-suggestion.png')
        await click('Approve')
        await wait("document.body.innerText.includes('Approved by Demo owner')")
        await click('Activity','a')
        await wait("document.body.innerText.includes('Action approved')")
        activity=await evaluate('document.body.innerText')
        assert all(x in activity for x in ['AI analysis generated','Action suggested','Action approved'])
        await shot('golden-persistent-activity.png')
        await call('Page.navigate',{'url':'http://127.0.0.1:4173/?path=/actions'})
        await wait("document.body.innerText.includes('Approved by Demo owner')")
        await evaluate("globalThis.__wu08_document='before-reload'")
        await call('Page.reload')
        await wait("globalThis.__wu08_document!=='before-reload' && document.body.innerText.includes('Approved by Demo owner')")
        refreshed=await evaluate('document.body.innerText')
        assert 'Nothing will be sent automatically.' in refreshed
        await shot('golden-refresh-approved.png')
        # This is the actual Next production build, with no test composition or cloud fallback.
        await call('Page.navigate',{'url':'http://127.0.0.1:3003/'})
        await wait("document.querySelector('h1')?.innerText==='BukuLokal Ops Copilot'")
        await click('Try Demo','a')
        await wait("document.body.innerText.includes('Workspace storage is not configured')")
        production=await evaluate('document.body.innerText')
        assert 'Workspace unavailable' in production and 'No substitute workspace was created' in production
        assert 'Orders\n\n12' not in production
        await shot('production-persistence-unavailable.png')
        report={'test_composition':{'explicit':True,'firestore_network':'memory transport','gemini_network':'test provider','dashboard':dashboard,'so001':evidence,'activity':activity,'refresh':refreshed},'production_composition':{'storage_configured':False,'truthful_error':production},'demo_timing':{'elapsed_seconds':elapsed,'measurement':'Landing to first validated recommendation','live_cloud_latency_measured':False},'live_golden_path_smoke_test':'NOT_RUN_MISSING_CLOUD_CONFIG'}
        (ROOT/'docs/evidence/WU-08/browser-checks.json').write_text(json.dumps(report,indent=2))
        print(json.dumps({'golden_path':'PASS','refresh_durability':'PASS','production_configuration_state':'PASS','elapsed_seconds':elapsed},indent=2))
asyncio.run(main())

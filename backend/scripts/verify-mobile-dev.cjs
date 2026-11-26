const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const path = require('node:path');
const cert = process.argv[2];
if (!cert) throw Error('Pass the directory containing the loopback leaf.key and leaf.pem files.');
const proc = spawn(process.execPath, [path.join(__dirname, 'mobile-dev.js'),'127.0.0.1', path.join(cert,'leaf.key'),path.join(cert,'leaf.pem')], {stdio:['ignore','pipe','inherit']});
const timeout = setTimeout(() => proc.kill(), 60000).unref();
(async () => {
  let stdout = '';
  const password = await Promise.race([new Promise(resolve => {
    proc.stdout.on('data', part => { stdout += part; const match = stdout.match(/Temporary password: ([\w-]+)\r?\n/); if (match) resolve(match[1]); });
  }), once(proc, 'exit').then(code => { throw Error('Fixture exited: ' + code); })]);
  const api = 'https://127.0.0.1:5443/api';
  async function call(url, method='GET', token, body, extra = {}, expected = 200) {
    const response = await fetch(api + url, {method, headers: {
      'X-ParkFair-Session':'native', ...(token && {Authorization:'Bearer '+token}),
      ...(body && {'Content-Type':typeof body === 'string' ? 'text/csv' : 'application/json'}), ...extra
    }, body: typeof body === 'string' ? body : JSON.stringify(body)});
    const data = await response.json();
    assert.equal(response.status, expected, JSON.stringify({url,message:data.message,code:data.code}));
    return data;
  }
  const login = identifier => call('/auth/login','POST',null,{identifier,password});
  const admin = (await login('mobile-admin')).token;
  const date = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date());
  const later = new Date(Date.parse(date)+86400000*3).toISOString().slice(0,10);
  const create = async (cycleName,startDate) => (await call('/cycles','POST',admin,{cycleName,startDate,endDate:startDate,durationDays:1},{},201)).data;
  async function prepare(cycle, bay) {
    const draft = (await call('/allocation-drafts','POST',admin,{cycleId:cycle._id},{},201)).draft;
    const base = '/allocation-drafts/'+draft._id;
    const chart = 'Apartment,Space,Registration\n001,' + bay + ',FIX-A';
    const headers = {'X-ParkFair-Filename':'review.csv','X-ParkFair-Columns':'{"flatNumber":1,"slotNumber":2,"vehicleNumber":3}'};
    assert.equal((await call(base+'/import-preview','POST',admin,chart,headers)).dataRows,1);
    await call(base+'/import','POST',admin,chart,{...headers,'If-Match':'"1"'},201);
    assert.equal((await call(base+'/validate','POST',admin,{revision:2})).draft.status,'DRAFT');
    await call(base,'PUT',admin,{revision:2,rows:[{flatNumber:'001',slotNumber:bay,vehicleNumber:'FIX-A'}],exclusions:[{flatNumber:'002',reason:'Synthetic reviewed exclusion'}]});
    assert.equal((await call(base+'/validate','POST',admin,{revision:3})).draft.status,'VALIDATED');
    await call(base+'/approve','POST',admin,{revision:3});
    return (await call(base+'/publish','POST',admin,{revision:3},{'Idempotency-Key':'phase4b-'+draft._id},201)).publication;
  }
  const current = await create('Mobile E2E',date);
  const pub = await prepare(current,'A-12');
  await call('/cycles/'+current._id+'/status','PUT',admin,{status:'ACTIVE',publicationId:pub._id});
  await prepare(await create('Future E2E',later),'C-03');
  const resident = await login('mobile-resident');
  assert.equal((await call('/resident/dashboard','GET',resident.token)).parking.slot,'A-12');
  const schedule = await call('/resident/schedule','GET',resident.token);
  assert.equal(schedule.current.parking.slot,'A-12');
  assert.equal(schedule.next.parking.slot,'C-03');
  assert.deepEqual((await call('/resident/history','GET',resident.token)).history,[]);
  const rotated = await call('/auth/refresh','POST',null,{refreshToken:resident.refreshToken});
  await call('/auth/logout','POST',null,{refreshToken:rotated.refreshToken});
  await call('/resident/dashboard','GET',rotated.token,undefined,{},401);
  console.log('Trusted HTTPS: mapped CSV, coverage, approval, publish, activation, current/next/history, refresh rotation and logout passed.');
})().catch(error=>{console.error(error.message);process.exitCode=1}).finally(()=>{ clearTimeout(timeout); proc.kill(); });

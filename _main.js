
	// ==================== 登录 ====================
(function(){
var exp = localStorage.getItem('cms_login_expire');
if (exp && parseInt(exp) > Date.now() && localStorage.getItem('cms_logged_in') === 'true') return;
if (sessionStorage.getItem('cms_logged_in') === 'true') return;
// 隐藏主界面，显示登录框
var sb=document.getElementById('sidebar');if(sb)sb.style.display='none';
var mn=document.querySelector('.main');if(mn)mn.style.display='none';
var lb=document.createElement('div');
lb.innerHTML='<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#1a0a0a,#4a1525,#8B1A2B);z-index:99999;display:flex;align-items:center;justify-content:center"><div style="background:#fff;border-radius:14px;padding:40px;width:400px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,.3)"><h2 style="text-align:center;color:#C41230;margin-bottom:4px;font-size:22px">四川省闽南商会</h2><div style="text-align:center;color:#C9A84C;font-size:12px;margin-bottom:28px">管理后台</div><div style="margin-bottom:18px"><label style="display:block;font-size:13px;color:#555;margin-bottom:6px;font-weight:600">账号</label><div style="display:flex;align-items:center;border:2px solid #E8E8E8;border-radius:8px;overflow:hidden"><i class="fa fa-user-circle-o" style="width:40px;text-align:center;color:#999"></i><input id="loginUser" type="text" placeholder="请输入账号" value="admin" style="flex:1;padding:12px;border:none;outline:none;font-size:14px"></div></div><div style="margin-bottom:18px"><label style="display:block;font-size:13px;color:#555;margin-bottom:6px;font-weight:600">密码</label><div style="display:flex;align-items:center;border:2px solid #E8E8E8;border-radius:8px;overflow:hidden"><i class="fa fa-key" style="width:40px;text-align:center;color:#999"></i><input id="loginPass" type="password" placeholder="请输入密码" style="flex:1;padding:12px;border:none;outline:none;font-size:14px"></div></div><button onclick="doLogin()" style="width:100%;padding:12px;background:linear-gradient(135deg,#C41230,#E8394A);color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer;font-weight:600">登 录</button><div id="loginErr" style="color:#C41230;font-size:13px;text-align:center;margin-top:12px;display:none"></div></div></div>';
document.body.appendChild(lb);
window.doLogin=function(){
var u=document.getElementById('loginUser').value.trim();
var p=document.getElementById('loginPass').value.trim();
if(u==='admin'&&p==='admin888'){sessionStorage.setItem('cms_logged_in','true');localStorage.setItem('cms_logged_in','true');localStorage.setItem('cms_login_expire',Date.now()+7*24*3600*1000);location.reload();}
else{var er=document.getElementById('loginErr');er.style.display='block';er.textContent='账号或密码错误';}
};
document.getElementById('loginPass').addEventListener('keydown',function(e){if(e.key==='Enter')doLogin();});
throw new Error('login');
})();
// ==================== 数据层 ====================
var SK='scmn_cms_data_v2';
var CMS_CACHE=null;
var IDB_DB=null;
var IDB_READY=false;
var _saveQueue=null;
function idbOpen(){return new Promise(function(resolve,reject){var req=indexedDB.open('scmnsh_cms',1);req.onupgradeneeded=function(e){var db=e.target.result;if(!db.objectStoreNames.contains('data'))db.createObjectStore('data');};req.onsuccess=function(e){IDB_DB=e.target.result;resolve(IDB_DB);};req.onerror=function(e){reject(e.target.error);};});}
function idbLoad(){return new Promise(function(resolve,reject){if(!IDB_DB){resolve(null);return;}var tx=IDB_DB.transaction('data','readonly');var store=tx.objectStore('data');var req=store.get('cms_data');req.onsuccess=function(){resolve(req.result);};req.onerror=function(){reject(req.error);};});}
function idbSave(data){return new Promise(function(resolve,reject){if(!IDB_DB){resolve();return;}var tx=IDB_DB.transaction('data','readwrite');var store=tx.objectStore('data');var req=store.put(data,'cms_data');req.onsuccess=function(){resolve();};req.onerror=function(){reject(req.error);};});}
function defData(){return{
banner:[],about:{en:'ABOUT US',cn:'了解商会',img:'',p1:'',p2:'',link:'#',stats:[]},
leadership:[],president:{name:'',title:'',img:'',content:''},
honors:[],milestones:[],
party:{name:'党委',intro:'',structImg:'',structDesc:'',news:[],history:[]},
news:[],biznews:[],services:{desc:'',items:[]},partners:[],strategy:[],
joinus:{title:'加入我们',req:'',process:'',contact:''},
footer:{title:'四川省闽南商会',keywords:'',desc:'',headerLogo:'',logo:'',slogan:'如果您有需求，请联系我们；我们将竭诚为您服务！',email:'',addr:'',phone:'',icp:'',copyright:'Copyright © 四川省闽南商会 All Rights Reserved'}
};}
function L(){if(CMS_CACHE)return JSON.parse(JSON.stringify(CMS_CACHE));return defData();}
function S(d){try{var cloned=JSON.parse(JSON.stringify(d));CMS_CACHE=cloned;}catch(e){T('保存失败：数据序列化异常','error');console.error('S() JSON clone error:',e);return;}try{var js=JSON.stringify(CMS_CACHE);localStorage.setItem(SK,js);}catch(e){}if(!IDB_READY){_saveQueue=CMS_CACHE;console.warn('IndexedDB 未就绪，数据已暂存内存，待就绪后自动保存');return;}idbSave(CMS_CACHE).then(function(){console.log('IndexedDB 保存成功');}).catch(function(e){console.error('IndexedDB 保存失败：',e);if(e.name==='QuotaExceededError'||e.toString().indexOf('quota')>-1||e.toString().indexOf('Quota')>-1){T('存储空间不足！请到控制台点击"极限压缩全部图片"释放空间','error');}else{T('IndexedDB 保存失败：'+e.message+'（数据已暂存本地缓存，请勿关闭页面）','warning');}});}
function T(m,t){var e=document.getElementById('toast');e.textContent=m;e.className='toast '+(t||'success')+' show';clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove('show')},2000);}
function esc(s){if(!s&&s!==0)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

// ==================== 页面切换 ====================
document.querySelectorAll('.sidebar nav a[data-page]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();switchPage(this.getAttribute('data-page'));});});
function switchPage(pg){
document.querySelectorAll('.sidebar nav a[data-page]').forEach(function(a){a.classList.remove('active');});
var t=document.querySelector('.sidebar nav a[data-page="'+pg+'"]');if(t)t.classList.add('active');
document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
var el=document.getElementById('page-'+pg);if(el)el.classList.add('active');
renderPage(pg);document.getElementById('sidebar').classList.remove('open');
}
function renderPage(pg){
var d=L();
switch(pg){
case'dashboard':renderDash(d);break;
case'banner':renderTable('banner-list','banner',d.banner,['img','title','subtitle','btnText','btnLink'],{img:'图片URL',title:'标题',subtitle:'副标题',btnText:'按钮文字',btnLink:'按钮链接'},{sort:'排序'});break;
case'about':renderAbout(d);break;
case'leadership':renderTable('ld-list','leadership',d.leadership,['name','title','img','desc'],{name:'姓名',title:'职务',img:'照片URL',desc:'简介'},{sort:'排序'});break;
case'president':renderPresident(d);break;
case'honors':renderTable('honors-list','honors',d.honors,['year','title','desc','img'],{year:'年份',title:'荣誉名称',desc:'描述',img:'图片URL'});break;
case'milestones':(d.milestones||[]).sort(function(a,b){return parseInt(b.year)-parseInt(a.year)||(b.month||'').localeCompare(a.month||'');});renderTable('ms-list','milestones',d.milestones,['year','month','title','desc'],{year:'年份',month:'月份',title:'事件标题',desc:'详细描述'});break;
case'party':renderParty(d);break;
	case'party-history':(d.party.history||[]).sort(function(a,b){return parseInt(b.year)-parseInt(a.year)||(b.month||'').localeCompare(a.month||'');});renderTable('py-history-list','partyHistory',d.party.history||[],['year','month','title','desc'],{year:'年份',month:'月份',title:'事件标题',desc:'详细描述'});break;
case'news':renderCombinedNews(d);break;
case'services':renderServices(d);break;
case'partners':renderTable('pt-list','partners',d.partners,['name','img','link'],{name:'名称',img:'Logo URL',link:'链接'});break;
case'strategy':renderTable('sg-list','strategy',d.strategy,['name','img','link','desc'],{name:'名称',img:'Logo URL',link:'链接',desc:'简介'});break;
case'joinus':renderJoinUs(d);break;
case'applications':renderApps();break;
case'footer':renderFooter(d);break;
}
}

// ==================== 控制台 ====================
function renderCombinedNews(d){
var all=(d.news||[]).concat(d.biznews||[]);
renderTable('news-list','combinedNews',all,['date','title','img','link'],{date:'日期(YYYY-MM-DD)',title:'标题',img:'图片URL',link:'链接'});
}
function renderDash(d){
var items=[
{icon:'red',fa:'fa-image',num:d.banner.length,label:'Banner'},
{icon:'gold',fa:'fa-users',num:d.leadership.length,label:'领导班子'},
{icon:'green',fa:'fa-history',num:d.milestones.length,label:'大事记'},
{icon:'red',fa:'fa-flag',num:d.party.news.length,label:'党建新闻'},{icon:'gold',fa:'fa-history',num:(d.party.history||[]).length,label:'发展历程'},
{icon:'gold',fa:'fa-newspaper-o',num:d.news.length,label:'商会新闻'},
{icon:'green',fa:'fa-cubes',num:d.services.items.length,label:'服务项目'},{icon:'purple',fa:'fa-envelope',num:(function(){try{return JSON.parse(localStorage.getItem('scmn_applications')||'[]').length}catch(e){return 0}})(),label:'入会申请'},
{icon:'purple',fa:'fa-handshake-o',num:d.partners.length,label:'合作伙伴'},
{icon:'gold',fa:'fa-star',num:d.strategy.length,label:'战略伙伴'}
];
document.getElementById('dash-stats').innerHTML=items.map(function(i){return'<div class="stat-card"><div class="icon '+i.icon+'"><i class="fa '+i.fa+'"></i></div><div><div class="num">'+i.num+'</div><div class="label">'+i.label+'</div></div></div>';}).join('');
// 显示数据占用（IndexedDB 存储，上限可达数百MB）
var raw=JSON.stringify(CMS_CACHE||d);
var kb=Math.round(raw.length/1024);
var info=document.getElementById('storage-info');
if(info){
if(kb>=1024){info.innerHTML='<i class="fa fa-database"></i> 数据占用：<b style="color:#e67e22">'+(kb/1024).toFixed(1)+' MB</b>（IndexedDB 存储）';}
else{info.innerHTML='<i class="fa fa-database"></i> 数据占用：<b style="color:#27ae60">'+kb+' KB</b>（IndexedDB 存储）';}
}
}

// ==================== 通用表格渲染 ====================
function renderTable(listId,key,items,fields,labels,extra){
extra=extra||{};
var c=document.getElementById(listId);
if(!items||items.length===0){c.innerHTML='<div class="empty-state"><i class="fa fa-inbox"></i><p>暂无内容，点击下方按钮添加</p></div>';return;}
var fKeys=Object.keys(labels);
var allKeys=fKeys.concat(Object.keys(extra));
var h='<div class="table-wrap"><table><thead><tr><th>#</th>';
allKeys.forEach(function(k){h+='<th>'+(labels[k]||extra[k]||k)+'</th>';});
h+='<th>操作</th></tr></thead><tbody>';
items.forEach(function(item,i){
h+='<tr><td>'+(i+1)+'</td>';
allKeys.forEach(function(k){
var v=item[k]!==undefined?item[k]:'';
if(k==='img'||k==='structImg'){
h+='<td>'+(v?'<img src="'+esc(v)+'" class="preview-img">':'')+'<input class="mini-input" value="'+esc(v)+'" onchange="uF(\''+key+'\','+i+',\''+k+'\',this.value)" style="margin-top:4px;"><button class="btn btn-sm btn-outline" onclick="uploadImg(this,\''+key+'\','+i+',\''+k+'\')" style="margin-top:2px;font-size:11px;"><i class="fa fa-upload"></i> 本地上传</button></td>';
}else if(k==='link'){
var isDataLink=v.startsWith('data:');
h+='<td><input class="mini-input" value="'+esc(v)+'" onchange="uF(\''+key+'\','+i+',\''+k+'\',this.value)" style="'+(isDataLink?'border-color:#e74c3c;background:#fff5f5;':'')+'">'+(isDataLink?'<span style="color:#e74c3c;font-size:10px;display:block;">⚠ 请填写网页URL，不要粘贴图片数据</span>':'')+'</td>';
}else{
h+='<td><input class="mini-input" value="'+esc(v)+'" onchange="uF(\''+key+'\','+i+',\''+k+'\',this.value)"></td>';
}
});
h+='<td><button class="btn btn-sm btn-danger" onclick="dI(\''+key+'\','+i+')"><i class="fa fa-trash"></i></button></td></tr>';
});
h+='</tbody></table></div>';
c.innerHTML=h;
}

	// 通用：添加列表项（自动识别普通数组、services.items、party.news）
	function addItem(key,defaults){
	var d=L();
	if(key==='partyNews'){if(!d.party)d.party={};if(!d.party.news)d.party.news=[];d.party.news.push(defaults);S(d);renderPage(getCurrentPage());return;}if(key==='partyHistory'){if(!d.party)d.party={};if(!d.party.history)d.party.history=[];d.party.history.push(defaults);S(d);renderPage(getCurrentPage());return;}
	if(key==='services'){if(!d.services.items)d.services.items=[];d.services.items.push(defaults);S(d);renderPage(getCurrentPage());return;}
	if(!d[key])d[key]=[];
	if(Array.isArray(d[key])){d[key].push(defaults);S(d);renderPage(getCurrentPage());T('已添加','success');}else{T('添加失败：数据异常','error');}
	}
	// 通用：删除列表项
	function dI(key,i){
	if(!confirm('确定删除？'))return;
	var d=L();
	if(key==='combinedNews'){var ci=i,cn=(d.news||[]).length;if(ci<cn){d.news.splice(ci,1)}else if(d.biznews){d.biznews.splice(ci-cn,1)}S(d);renderPage(getCurrentPage());return;}if(key==='partyNews'){if(d.party.news)d.party.news.splice(i,1);S(d);renderPage(getCurrentPage());return;}if(key==='partyHistory'){if(d.party.history)d.party.history.splice(i,1);S(d);renderPage(getCurrentPage());return;}
	if(key==='services'){if(d.services.items)d.services.items.splice(i,1);S(d);renderPage(getCurrentPage());return;}
	if(Array.isArray(d[key])){d[key].splice(i,1);S(d);renderPage(getCurrentPage());}
	}
	// 通用：更新列表项字段（行内编辑自动保存）
	function uF(key,i,field,value){
	if(field==='link'&&value.startsWith('data:')){T('警告：链接字段不应填写图片数据！请填写网页URL','error');}
	var d=L();
	if(key==='combinedNews'){var ci=i,cn=(d.news||[]).length;if(ci<cn){d.news[ci][field]=value}else if(d.biznews){d.biznews[ci-cn][field]=value}S(d);return;}if(key==='partyNews'){if(d.party.news)d.party.news[i][field]=value;S(d);return;}if(key==='partyHistory'){if(d.party.history)d.party.history[i][field]=value;S(d);return;}
	if(key==='services'){if(d.services.items)d.services.items[i][field]=value;S(d);return;}
	if(key==='party'){
	if(field.startsWith('struct'))d.party[field]=value;
	else if(d.party.news)d.party.news[i][field]=value;
	S(d);return;
	}
	if(Array.isArray(d[key])){d[key][i][field]=value;S(d);}
	}
// 本地上传图片转 base64
function uploadImg(btn,key,i,field){var inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=function(){var f=this.files[0];if(!f)return;try{compressImg(f,function(b64){try{uF(key,i,field,b64);var td=btn.parentElement;var mi=td.querySelector('.mini-input');if(mi)mi.value=b64;var pv=td.querySelector('.preview-img');if(pv){pv.src=b64;}else{var np=document.createElement('img');np.className='preview-img';np.src=b64;td.insertBefore(np,td.firstChild);}var kb=Math.round(b64.length/1024);if(kb>200){T('图片已上传（'+kb+'KB），体积较大建议更换小图','warning');}else{T('图片已上传（'+kb+'KB）','success');}}catch(e2){T('保存失败：'+e2.message,'error');}});}catch(e){T('上传失败：'+e.message,'error');}};inp.click();}
function getCurrentPage(){
var a=document.querySelector('.sidebar nav a.active');
return a?a.getAttribute('data-page'):'dashboard';
}

// ==================== 商会简介 ====================
function renderAbout(d){
var a=d.about;
document.getElementById('af-en').value=a.en||'';document.getElementById('af-cn').value=a.cn||'';
document.getElementById('af-img').value=a.img||'';document.getElementById('af-p1').value=a.p1||'';
document.getElementById('af-p2').value=a.p2||'';document.getElementById('af-link').value=a.link||'#';
var sc=document.getElementById('stats-list');
var st=a.stats||[];
if(st.length===0){sc.innerHTML='<div class="empty-state"><i class="fa fa-bar-chart"></i><p>暂无统计数据</p></div>';return;}
var h='<div class="table-wrap"><table><thead><tr><th>数字</th><th>单位</th><th>标签</th><th>操作</th></tr></thead><tbody>';
st.forEach(function(s,i){h+='<tr><td><input class="mini-input" value="'+esc(s.num||'0')+'" onchange="uSA('+i+',\'num\',this.value)"></td><td><input class="mini-input" value="'+esc(s.unit||'个')+'" onchange="uSA('+i+',\'unit\',this.value)"></td><td><input class="mini-input" value="'+esc(s.label||'')+'" onchange="uSA('+i+',\'label\',this.value)"></td><td><button class="btn btn-sm btn-danger" onclick="dSA('+i+')"><i class="fa fa-trash"></i></button></td></tr>';});
h+='</tbody></table></div>';sc.innerHTML=h;
}
function addStat(){var d=L();if(!d.about.stats)d.about.stats=[];d.about.stats.push({num:'0',unit:'个',label:'新统计项'});S(d);renderPage('about');}
function addLeader(){var d=L();if(!d.leadership)d.leadership=[];d.leadership.push({name:'',title:'',img:'',desc:'',sort:0});S(d);renderPage('leadership');T('已添加领导班子成员','success');}
function addBanner(){var d=L();if(!d.banner)d.banner=[];d.banner.push({img:'',title:'',subtitle:'',btnText:'',btnLink:'#',sort:0});S(d);renderPage('banner');T('已添加Banner','success');}
function dSA(i){var d=L();d.about.stats.splice(i,1);S(d);renderPage('about');}
function uSA(i,f,v){var d=L();d.about.stats[i][f]=v;S(d);}
function saveAbout(){var d=L();d.about.en=document.getElementById('af-en').value;d.about.cn=document.getElementById('af-cn').value;d.about.img=document.getElementById('af-img').value;d.about.p1=document.getElementById('af-p1').value;d.about.p2=document.getElementById('af-p2').value;d.about.link=document.getElementById('af-link').value;S(d);T('商会简介已保存');}

// ==================== 会长寄语 ====================
function renderPresident(d){var p=d.president;document.getElementById('pm-name').value=p.name||'';document.getElementById('pm-title').value=p.title||'';document.getElementById('pm-img').value=p.img||'';document.getElementById('pm-content').value=p.content||'';}
function savePresident(){var d=L();d.president.name=document.getElementById('pm-name').value;d.president.title=document.getElementById('pm-title').value;d.president.img=document.getElementById('pm-img').value;d.president.content=document.getElementById('pm-content').value;S(d);T('会长寄语已保存');}

// ==================== 商会党建 ====================
function renderParty(d){var p=d.party;document.getElementById('py-name').value=p.name||'';document.getElementById('py-intro').value=p.intro||'';document.getElementById('py-struct-img').value=p.structImg||'';document.getElementById('py-struct-desc').value=p.structDesc||'';var pn=p.news||[];pn.sort(function(a,b){return(b.date||'').localeCompare(a.date||'');});renderTable('py-news-list','partyNews',pn,['date','title','img','link'],{date:'日期',title:'标题',img:'图片URL',link:'链接'});}
function savePartyIntro(){var d=L();d.party.name=document.getElementById('py-name').value;d.party.intro=document.getElementById('py-intro').value;S(d);T('党委介绍已保存');}
function savePartyStruct(){var d=L();d.party.structImg=document.getElementById('py-struct-img').value;d.party.structDesc=document.getElementById('py-struct-desc').value;S(d);T('组织架构已保存');}

// ==================== 服务领域 ====================
function renderServices(d){
document.getElementById('sv-desc').value=d.services.desc||'';
var items=d.services.items||[];
var c=document.getElementById('sv-list');
if(items.length===0){c.innerHTML='<div class="empty-state"><i class="fa fa-cubes"></i><p>暂无服务</p></div>';return;}
var icons=['fa-handshake-o','fa-balance-scale','fa-line-chart','fa-plane','fa-bullhorn','fa-users','fa-file-text-o','fa-globe','fa-graduation-cap','fa-heart','fa-building-o','fa-shield','fa-star','fa-cogs','fa-lightbulb-o','fa-comments-o'];
var h='<div class="table-wrap"><table><thead><tr><th>图标</th><th>图标类名</th><th>名称</th><th>描述</th><th>操作</th></tr></thead><tbody>';
items.forEach(function(s,i){
var ih='';icons.forEach(function(ic){ih+='<label style="display:inline-block;margin:2px;cursor:pointer;"><input type="radio" name="svi'+i+'" value="'+ic+'"'+(s.icon===ic?' checked':'')+' onchange="uF(\'services\','+i+',\'icon\',this.value)"><i class="fa '+ic+'" style="font-size:16px;color:#C41230"></i></label>';});
h+='<tr><td style="min-width:260px">'+ih+'</td><td><input class="mini-input" value="'+esc(s.icon||'')+'" onchange="uF(\'services\','+i+',\'icon\',this.value)"></td><td><input class="mini-input" value="'+esc(s.name||'')+'" onchange="uF(\'services\','+i+',\'name\',this.value)"></td><td><input class="mini-input" value="'+esc(s.desc||'')+'" onchange="uF(\'services\','+i+',\'desc\',this.value)"></td><td><button class="btn btn-sm btn-danger" onclick="dI(\'services\','+i+')"><i class="fa fa-trash"></i></button></td></tr>';
});
h+='</tbody></table></div>';c.innerHTML=h;
}
	function saveSvcDesc(){var d=L();d.services.desc=document.getElementById("sv-desc").value;S(d);T("服务描述已保存");}

// ==================== 加入我们 ====================
function renderJoinUs(d){var j=d.joinus;document.getElementById('ju-title').value=j.title||'';document.getElementById('ju-req').value=j.req||'';document.getElementById('ju-process').value=j.process||'';document.getElementById('ju-contact').value=j.contact||'';}
function saveJoinUs(){var d=L();d.joinus.title=document.getElementById('ju-title').value;d.joinus.req=document.getElementById('ju-req').value;d.joinus.process=document.getElementById('ju-process').value;d.joinus.contact=document.getElementById('ju-contact').value;S(d);T('加入我们已保存');}

// ==================== 入会申请管理 ====================
function renderApps(){refreshApps();}
function refreshApps(){
var c=document.getElementById('app-list');
var apps=[];
try{apps=JSON.parse(localStorage.getItem('scmn_applications')||'[]');}catch(e){}
if(apps.length===0){c.innerHTML='<div class="empty-state"><i class="fa fa-envelope-o"></i><p>暂无入会申请</p></div>';return;}
var h='<div class="table-wrap"><table><thead><tr><th>提交时间</th><th>企业名称</th><th>联系人</th><th>手机</th><th>邮箱</th><th>行业</th><th>备注</th><th>状态</th><th>操作</th></tr></thead><tbody>';
apps.forEach(function(a,i){
h+='<tr>';
h+='<td>'+(a.time||'')+'</td>';
h+='<td>'+(a.company||'')+'</td>';
h+='<td>'+(a.name||'')+'</td>';
h+='<td>'+(a.phone||'')+'</td>';
h+='<td>'+(a.email||'')+'</td>';
h+='<td>'+(a.industry||'')+'</td>';
h+='<td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(a.remark||'')+'</td>';
h+='<td><select class="mini-input" onchange="updateAppStatus('+a.id+',this.value)" style="width:80px;"><option value="待审核"'+(a.status==='待审核'?' selected':'')+'>待审核</option><option value="已通过"'+(a.status==='已通过'?' selected':'')+'>已通过</option><option value="已拒绝"'+(a.status==='已拒绝'?' selected':'')+'>已拒绝</option></select></td>';
h+='<td><button class="btn btn-sm btn-danger" onclick="deleteApp('+a.id+')"><i class="fa fa-trash"></i></button></td>';
h+='</tr>';
});
h+='</tbody></table></div>';
c.innerHTML=h;
}
function updateAppStatus(id,status){
var apps=JSON.parse(localStorage.getItem('scmn_applications')||'[]');
var found=apps.find(function(a){return a.id===id;});
if(found){found.status=status;localStorage.setItem('scmn_applications',JSON.stringify(apps));T('状态已更新');}
}
function deleteApp(id){
if(!confirm('确定删除此申请？'))return;
var apps=JSON.parse(localStorage.getItem('scmn_applications')||'[]');
apps=apps.filter(function(a){return a.id!==id;});
localStorage.setItem('scmn_applications',JSON.stringify(apps));
refreshApps();T('申请已删除');
}
function exportApps(){
var apps=localStorage.getItem('scmn_applications')||'[]';
var b=new Blob([apps],{type:'application/json'});
var u=URL.createObjectURL(b);var a=document.createElement('a');a.href=u;a.download='scmn_applications_backup.json';a.click();URL.revokeObjectURL(u);
T('申请数据已导出');
}
function importApps(inp){
var f=inp.files[0];if(!f)return;
var r=new FileReader();r.onload=function(e){try{
var data=JSON.parse(e.target.result);
var existing=JSON.parse(localStorage.getItem('scmn_applications')||'[]');
var merged=data.concat(existing);
localStorage.setItem('scmn_applications',JSON.stringify(merged));
refreshApps();T('导入成功，已合并数据');
}catch(err){T('文件格式错误','error');}};r.readAsText(f);
}

// ==================== 联系方式 ====================
function renderFooter(d){var f=d.footer;document.getElementById('ft-title').value=f.title||'';document.getElementById('ft-keywords').value=f.keywords||'';document.getElementById('ft-desc').value=f.desc||'';document.getElementById('ft-header-logo').value=f.headerLogo||'';document.getElementById('ft-logo').value=f.logo||'';document.getElementById('ft-slogan').value=f.slogan||'';document.getElementById('ft-email').value=f.email||'';document.getElementById('ft-phone').value=f.phone||'';document.getElementById('ft-addr').value=f.addr||'';document.getElementById('ft-icp').value=f.icp||'';document.getElementById('ft-copyright').value=f.copyright||'';}
function saveFooter(){var d=L();var f=d.footer;f.title=document.getElementById('ft-title').value;f.keywords=document.getElementById('ft-keywords').value;f.desc=document.getElementById('ft-desc').value;f.headerLogo=document.getElementById('ft-header-logo').value;f.logo=document.getElementById('ft-logo').value;f.slogan=document.getElementById('ft-slogan').value;f.email=document.getElementById('ft-email').value;f.phone=document.getElementById('ft-phone').value;f.addr=document.getElementById('ft-addr').value;f.icp=document.getElementById('ft-icp').value;f.copyright=document.getElementById('ft-copyright').value;S(d);T('联系方式已保存');}

// ==================== 导入导出与发布 ====================
function compressImg(file,cb){var r=new FileReader();r.onerror=function(){T('文件读取失败，请重试','error');};r.onload=function(e){var img=new Image();img.onerror=function(){T('图片格式不支持，请选择 JPG/PNG/GIF 图片','error');};img.onload=function(){var c=document.createElement('canvas');var maxW=300;var w=img.width,h=img.height;if(w>maxW){h=Math.round(h*maxW/w);w=maxW;}c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);cb(c.toDataURL('image/jpeg',0.5));};img.src=e.target.result;};r.readAsDataURL(file);}
function uploadToField(fieldId){var inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=function(){var f=this.files[0];if(!f)return;try{compressImg(f,function(b64){try{document.getElementById(fieldId).value=b64;var kb=Math.round(b64.length/1024);if(kb>200){T('图片已上传（'+kb+'KB），体积较大建议更换小图','warning');}else{T('图片已上传（'+kb+'KB）','success');}}catch(e2){T('保存失败：'+e2.message,'error');}});}catch(e){T('上传失败：'+e.message,'error');}};inp.click();}
function getGitHubToken(){
var t=localStorage.getItem('scmn_gh_token');
if(!t){t=prompt('首次使用需要 GitHub Token（仅需一次）：\n\n1. 新窗口打开 https://github.com/settings/tokens\n2. Generate new token (classic)\n3. 勾选 repo，点 Generate\n4. 复制 token 粘贴到下方：\n','');if(t){localStorage.setItem('scmn_gh_token',t);T('Token 已保存，再次点击发布即可','success');return null;}}
return t||null;
}
function compressBase64Async(b64){return new Promise(function(resolve){if(!b64||b64.length<200||!/^data:image/.test(b64)){resolve(b64);return;}var img=new Image();img.onload=function(){var c=document.createElement('canvas');var maxW=800;var w=img.width,h=img.height;if(w>maxW){h=Math.round(h*maxW/w);w=maxW;}c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',0.7));};img.onerror=function(){resolve(b64);};img.src=b64;});}
async function compressAllImages(d){var isB64=/^data:image/;var tasks=[];function walk(obj){if(!obj||typeof obj!=='object')return;if(Array.isArray(obj)){for(var i=0;i<obj.length;i++)walk(obj[i]);return;}for(var k in obj){var v=obj[k];if(typeof v==='string'&&isB64.test(v)&&v.length>200){(function(key){tasks.push(compressBase64Async(v).then(function(r){obj[key]=r;}));})(k);}else if(typeof v==='object'){walk(v);}}}walk(d);await Promise.all(tasks);T('图片压缩完成（共'+tasks.length+'张）','success');}
function compactBase64Async(b64){return new Promise(function(resolve){if(!b64||b64.length<200||!/^data:image/.test(b64)){resolve(b64);return;}var img=new Image();img.onerror=function(){resolve(b64);};img.onload=function(){var c=document.createElement('canvas');var maxW=300;var w=img.width,h=img.height;if(w>maxW){h=Math.round(h*maxW/w);w=maxW;}c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',0.5));};img.src=b64;});}
async function compactAllImages(){if(!confirm('将把所有图片极限压缩为300px宽、JPEG-50%质量，以释放存储空间。\n\n建议先"备份数据 JSON"以防万一。\n\n确定继续？'))return;T('正在极限压缩...','warning');try{var d=L();var backup=JSON.parse(JSON.stringify(d));var isB64=/^data:image/;var tasks=[];function walk(obj){if(!obj||typeof obj!=='object')return;if(Array.isArray(obj)){for(var i=0;i<obj.length;i++)walk(obj[i]);return;}for(var k in obj){var v=obj[k];if(typeof v==='string'&&isB64.test(v)&&v.length>200){(function(key){tasks.push(compactBase64Async(v).then(function(r){obj[key]=r;}));})(k);}else if(typeof v==='object'){walk(v);}}}walk(d);await Promise.all(tasks);try{localStorage.setItem(SK+'_backup',JSON.stringify(backup));}catch(e2){}S(d);var before=Math.round(JSON.stringify(backup).length/1024);var after=Math.round(JSON.stringify(d).length/1024);var saved=before-after;T('极限压缩完成！共 '+tasks.length+' 张，从 '+before+'KB → '+after+'KB'+(saved>0?'，节省 '+saved+'KB':''),'success');renderPage('dashboard');}catch(e){T('压缩失败：'+e.message,'error');}}
async function publishSite(){
var token=getGitHubToken();
if(!token){T('需要 GitHub Token 才能自动发布','error');return;}
T('正在压缩图片并发布...','warning');
try{
var d=L();
// 备份原始数据，防止压缩失败导致数据损坏
var backup=JSON.parse(JSON.stringify(d));
await compressAllImages(d);
T('开始上传到GitHub...','warning');
var js='// 四川省闽南商会 - 网站数据文件（由管理后台自动生成）\n// 上传此文件到服务器即可更新网站内容\nwindow.__CMS_DATA__ = '+JSON.stringify(d,null,2)+';\n';
var base64=btoa(unescape(encodeURIComponent(js)));
var owner='d0gegg666',repo='scmnsh',path='data.js';
// 1. 获取当前文件的 SHA
var resp=await fetch('https://api.github.com/repos/'+owner+'/'+repo+'/contents/'+path,{headers:{Authorization:'Bearer '+token}});
if(!resp.ok){var e2=await resp.json();throw new Error('获取文件信息失败：'+(e2.message||resp.status));}
var info=await resp.json();
var sha=info.sha||'';
// 2. 提交新文件
var body=JSON.stringify({message:'CMS 后台自动更新 data.js',content:base64,sha:sha});
resp=await fetch('https://api.github.com/repos/'+owner+'/'+repo+'/contents/'+path,{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body});
if(resp.ok){
// 发布成功后保存压缩版数据到 localStorage（节省空间），同时保留原始备份
try{localStorage.setItem(SK+'_backup',JSON.stringify(backup));}catch(e2){}
S(d);
T('发布成功！图片已压缩，1-2分钟后网站自动更新','success');
}
else{var err=await resp.json();T('发布失败：'+err.message,'error');}
// 3. 同时下载备份
var b=new Blob([js],{type:'application/javascript'});
var u=URL.createObjectURL(b);var a=document.createElement('a');a.href=u;a.download='data.js';a.click();URL.revokeObjectURL(u);
}catch(e){T('发布失败：'+e.message,'error');console.error(e);}
}
function exportData(){
var b=new Blob([JSON.stringify(L(),null,2)],{type:'application/json'});
var u=URL.createObjectURL(b);var a=document.createElement('a');a.href=u;a.download='scmn_backup.json';a.click();URL.revokeObjectURL(u);
T('备份已导出');
}
function importData(inp){
var f=inp.files[0];if(!f)return;
var r=new FileReader();r.onload=function(e){try{var d=JSON.parse(e.target.result);CMS_CACHE=d;if(IDB_DB){idbSave(d).catch(function(){});}try{localStorage.setItem(SK+'_backup',JSON.stringify(d));}catch(e2){}T('导入成功，页面将刷新');setTimeout(function(){location.reload()},1000);}catch(err){T('文件格式错误','error');}};r.readAsText(f);
}
function clearAllData(){CMS_CACHE=defData();if(IDB_DB){idbSave(CMS_CACHE).catch(function(){});}try{localStorage.removeItem(SK);localStorage.removeItem(SK+'_backup');}catch(e){}T('数据已清空，页面将刷新');setTimeout(function(){location.reload()},1000);}

// ==================== 退出 ====================
function logout(){if(confirm('确定退出登录？')){sessionStorage.removeItem('cms_logged_in');localStorage.removeItem('cms_logged_in');localStorage.removeItem('cms_login_expire');location.reload();}}

// ==================== 初始化 ====================
(async function(){
// 1. 初始化 IndexedDB
var idbOk=false;
try{await idbOpen();var idbData=await idbLoad();if(idbData){CMS_CACHE=idbData;}idbOk=true;}catch(e){console.error('IndexedDB 初始化失败：',e);}
// 2. 如果 IndexedDB 没数据，尝试从 localStorage 迁移
if(!CMS_CACHE){try{var legacy=localStorage.getItem(SK);if(legacy){CMS_CACHE=JSON.parse(legacy);}}catch(e){console.error('localStorage 数据迁移失败：',e);}}
// 3. 兜底
if(!CMS_CACHE){CMS_CACHE=defData();}
// 4. 补齐缺失字段
var df=defData();for(var k in df){if(!(k in CMS_CACHE))CMS_CACHE[k]=df[k];}
if(!CMS_CACHE.party.news)CMS_CACHE.party.news=[];
// 5. 标记就绪
IDB_READY=true;
// 6. 如果 IndexedDB 可用，写入初始数据 + 暂存队列
if(idbOk&&IDB_DB){if(_saveQueue){CMS_CACHE=_saveQueue;_saveQueue=null;}idbSave(CMS_CACHE).catch(function(e){console.error('初始保存失败：',e);});}
else{console.warn('IndexedDB 不可用，仅依赖 localStorage（数据量较大时可能保存失败）');}
renderDash(CMS_CACHE);
})();

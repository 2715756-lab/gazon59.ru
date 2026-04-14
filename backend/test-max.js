// Test MAX API connectivity
const MAX_TOKEN = 'f9LHodD0cOJcVyQlLQlQ7U_bLNrgACgdrTmznRt54te6uzKK-ZwrCHfqEZCq-lp5L6GlGvq3cR26Kr4PmPRs';
const CHAT_ID = 8755559;

const testMessage = {
  chat_id: CHAT_ID,
  text: '✅ Тест интеграции Газон АкваГрин\n👤 Имя: Тестовая заявка\n📞 Телефон: +7-999-999-99-99',
  format: 'html'
};

console.log('Testing MAX API connectivity...');
console.log('Token present:', !!MAX_TOKEN);
console.log('Chat ID:', CHAT_ID);

fetch('https://platform-api.max.ru/messages', {
  method: 'POST',
  headers: {
    'Authorization': MAX_TOKEN,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testMessage)
})
.then(r => {
  console.log('✓ MAX API Response Status:', r.status);
  if (r.status === 200 || r.status === 201) {
    console.log('✓ MAX Integration test SUCCESSFUL');
  }
  return r.text();
})
.then(body => {
  console.log('Response:', body.substring(0, 200));
  process.exit(0);
})
.catch(e => {
  console.error('✗ MAX API Error:', e.message);
  process.exit(1);
});

setTimeout(() => {
  console.error('✗ Request timeout after 10s');
  process.exit(1);
}, 10000);

import os

path = r'c:\Users\ojuli\App II CIECC\src\views\info\WorkshopsView.jsx'

with open(path, 'rb') as f:
    content = f.read().decode('utf-8')

old_code = """const groupByTitle = (workshops) => {
  const map = {};
  const order = [];
  workshops.forEach(w => {
    if (!map[w.title]) {
      map[w.title] = { title: w.title, speakerName: w.speakerName, slots: {} };
      order.push(w.title);
    }
    map[w.title].slots[w.start_time.substring(0, 5)] = w;
  });
  return order.map(t => map[t]);
};"""

new_code = """const groupByTitle = (workshops) => {
  const map = {};
  workshops.forEach(w => {
    if (!map[w.title]) {
      map[w.title] = { title: w.title, speakerName: w.speakerName, slots: {}, totalRegistrations: 0 };
    }
    map[w.title].slots[w.start_time.substring(0, 5)] = w;
    map[w.title].totalRegistrations += (w.registrations || 0);
  });
  return Object.values(map).sort((a, b) => b.totalRegistrations - a.totalRegistrations);
};"""

# Try both \n and \r\n
if old_code in content:
    content = content.replace(old_code, new_code)
elif old_code.replace('\n', '\r\n') in content:
    content = content.replace(old_code.replace('\n', '\r\n'), new_code.replace('\n', '\r\n'))
else:
    print("Could not find old code block")
    exit(1)

with open(path, 'wb') as f:
    f.write(content.encode('utf-8'))

print("Successfully updated WorkshopsView.jsx")

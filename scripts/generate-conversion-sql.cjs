const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase_samples', 'lentille_conv.json'), 'utf8'));
const rows = data.map((r) => {
  const id = String(r.id);
  const num_enr = String(r.num_enr);
  const idtab = String(r.idtab_conversion);
  const lunettes = r.lunettes;
  const lun_plus = r.lun_plus == null ? 'NULL' : "'" + String(r.lun_plus) + "'";
  const lun_moins = r.lun_moins == null ? 'NULL' : "'" + String(r.lun_moins) + "'";
  return "INSERT INTO lentille_conv (id, num_enr, idtab_conversion, lunettes, lun_plus, lun_moins) VALUES ('" + id + "','" + num_enr + "','" + idtab + "'," + lunettes + "," + lun_plus + "," + lun_moins + ");";
});
const outPath = path.join(__dirname, '..', 'public', 'seed', 'conversion.sql');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, rows.join('\n'), 'utf8');
console.log('Wrote', rows.length, 'rows to public/seed/conversion.sql');

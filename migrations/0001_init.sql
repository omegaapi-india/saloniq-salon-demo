-- SalonIQ initial D1 schema and simulated seed data.
-- Shared database: omegaapi-demos. This app's namespace: SalonIQ.
 CREATE TABLE IF NOT EXISTS config (app TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY (app, key));
CREATE TABLE IF NOT EXISTS records (id INTEGER PRIMARY KEY AUTOINCREMENT, app TEXT NOT NULL, position INTEGER NOT NULL, cells TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS activity (id INTEGER PRIMARY KEY AUTOINCREMENT, app TEXT NOT NULL, text TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_records_app ON records(app, position);
CREATE INDEX IF NOT EXISTS idx_activity_app ON activity(app, id);

DELETE FROM activity WHERE app = 'SalonIQ';
DELETE FROM records WHERE app = 'SalonIQ';
DELETE FROM config WHERE app = 'SalonIQ';

INSERT INTO config (app, key, value) VALUES ('SalonIQ', 'heroStat', '"5 sample stylists · 3 open chairs"');
INSERT INTO config (app, key, value) VALUES ('SalonIQ', 'heroNote', '"Demo snapshot: afternoon bookings are filling up."');
INSERT INTO config (app, key, value) VALUES ('SalonIQ', 'bars', '[["Booked","w90"],["Walk-in","w60"],["Open","w75"]]');
INSERT INTO config (app, key, value) VALUES ('SalonIQ', 'strip', '[["5 sample stylists","Invented profiles"],["No customer details","Nothing personal collected"],["Database-backed","Actions stored in the demo database"],["Free to host","Cloudflare free tier"]]');
INSERT INTO config (app, key, value) VALUES ('SalonIQ', 'safetyNote', '"Stylists and services are fictional. No customer contact details are requested."');
INSERT INTO config (app, key, value) VALUES ('SalonIQ', 'tableHead', '["Stylist","Service","Next slot","Chair","Status"]');
INSERT INTO config (app, key, value) VALUES ('SalonIQ', 'rows', '[["A. Sharma","Haircut","10:00","Chair 1","Ready"],["M. Khan","Color","10:45","Chair 2","Busy"],["R. Verma","Styling","11:30","Chair 3","Ready"],["S. Iyer","Care","12:15","Chair 4","Break"],["T. Rao","Haircut","14:00","Chair 1","Ready"]]');
INSERT INTO config (app, key, value) VALUES ('SalonIQ', 'workflow', '[["Pick a stylist","Choose from the sample team."],["Choose a service","See a duration, not a real calendar hold."],["Log a chair","The chair note is saved in your browser only."]]');
INSERT INTO config (app, key, value) VALUES ('SalonIQ', 'actions', '[["Book appointment"," booked a sample appointment."],["Mark arrived"," marked a demo client arrived."],["Mark completed"," completed a sample service."],["Clear chairs"," cleared the demo chair view."]]');

INSERT INTO records (app, position, cells) VALUES ('SalonIQ', 1, '["A. Sharma","Haircut","10:00","Chair 1","Ready"]');
INSERT INTO records (app, position, cells) VALUES ('SalonIQ', 2, '["M. Khan","Color","10:45","Chair 2","Busy"]');
INSERT INTO records (app, position, cells) VALUES ('SalonIQ', 3, '["R. Verma","Styling","11:30","Chair 3","Ready"]');
INSERT INTO records (app, position, cells) VALUES ('SalonIQ', 4, '["S. Iyer","Care","12:15","Chair 4","Break"]');
INSERT INTO records (app, position, cells) VALUES ('SalonIQ', 5, '["T. Rao","Haircut","14:00","Chair 1","Ready"]');

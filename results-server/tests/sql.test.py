import sqlite3,re
from pathlib import Path
root=Path(__file__).resolve().parent.parent
db=sqlite3.connect(':memory:')
db.executescript(next((root/'drizzle').glob('*.sql')).read_text())
api=(root/'lib/results-api.ts').read_text()
history=re.search(r"historySql='([^']+)'",api)[1]
result=re.search(r"resultSql='([^']+)'",api)[1]
def report(identifier,a,b):
    with db:
        db.execute(history,(identifier,'game-1','A','B',a,b,'sideline','2026-10-18T12:00:00Z'))
        db.execute(result,(identifier,))
report('first',16,9);report('first',16,9)
assert db.execute('select count(*) from report_history').fetchone()[0]==1
report('correction',5,10);report('first',16,9)
assert db.execute('select score1,score2 from game_results').fetchone()==(5,10)
assert db.execute('select count(*) from game_results').fetchone()[0]==1
assert db.execute('select count(*) from report_history').fetchone()[0]==2
print('PASS: transactional history, duplicate retries, latest correction and no old-report overwrite.')

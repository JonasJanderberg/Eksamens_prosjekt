import argparse
import sys
from ldap3 import Server, Connection, ALL, NTLM, MODIFY_REPLACE

parser = argparse.ArgumentParser()
parser.add_argument('--username', required=True)
parser.add_argument('--action', required=True, choices=['enable', 'disable'])
args = parser.parse_args()

AD_SERVER = 'GORA.Bjornholt.local'
AD_USER   = 'bjornholt\\administrator'
AD_PASS   = 'Admin123'
BASE_DN   = 'OU=TECH,OU=HR,OU=Bjornholt,DC=Bjornholt,DC=local'

try:
    server = Server(AD_SERVER, get_info=ALL)
    conn = Connection(server, user=AD_USER, password=AD_PASS, authentication=NTLM, auto_bind=True)

    conn.search(BASE_DN, f'(sAMAccountName={args.username})', attributes=['distinguishedName', 'userAccountControl'])

    if not conn.entries:
        print(f"Bruker '{args.username}' ikke funnet.")
        sys.exit(1)

    dn = str(conn.entries[0].distinguishedName)
    uac = 512 if args.action == 'enable' else 514

    if conn.modify(dn, {'userAccountControl': [(MODIFY_REPLACE, [uac])]}):
        status = 'aktivert' if args.action == 'enable' else 'deaktivert'
        print(f"Bruker '{args.username}' er {status}.")
    else:
        print(f"Feil: {conn.result}")
        sys.exit(1)

except Exception as e:
    print(str(e), file=sys.stderr)
    sys.exit(1)

import argparse
import sys
from ldap3 import Server, Connection, ALL, NTLM

OU_MAP = {
    'ansatte': 'OU=TECH,OU=HR,OU=Bjornholt,DC=Bjornholt,DC=local',
    'elever':  'OU=TECH,OU=HR,OU=Bjornholt,DC=Bjornholt,DC=local',
    'ekstern': 'OU=TECH,OU=HR,OU=Bjornholt,DC=Bjornholt,DC=local',
}

parser = argparse.ArgumentParser()
parser.add_argument('--username', required=True)
parser.add_argument('--ou', required=True, choices=list(OU_MAP.keys()))
# Tilgjengelige OUer: ansatte, elever, ekstern
args = parser.parse_args()

AD_SERVER = 'GORA.Bjornholt.local'
AD_USER   = 'bjornholt\\administrator'
AD_PASS   = 'Admin123'
BASE_DN   = 'OU=TECH,OU=HR,OU=Bjornholt,DC=Bjornholt,DC=local'

try:
    server = Server(AD_SERVER, get_info=ALL)
    conn = Connection(server, user=AD_USER, password=AD_PASS, authentication=NTLM, auto_bind=True)

    conn.search(BASE_DN, f'(sAMAccountName={args.username})', attributes=['distinguishedName', 'cn'])

    if not conn.entries:
        print(f"Bruker '{args.username}' ikke funnet.")
        sys.exit(1)

    entry = conn.entries[0]
    dn = str(entry.distinguishedName)
    cn = str(entry.cn)
    target_ou = OU_MAP[args.ou]

    if conn.modify_dn(dn, f'CN={cn}', new_superior=target_ou):
        print(f"Bruker '{args.username}' er flyttet til {args.ou}.")
    else:
        print(f"Feil: {conn.result}")
        sys.exit(1)

except Exception as e:
    print(str(e), file=sys.stderr)
    sys.exit(1)

import argparse
import sys
from ldap3 import Server, Connection, ALL, NTLM, MODIFY_REPLACE

parser = argparse.ArgumentParser()
parser.add_argument('--username', required=True)
parser.add_argument('--password', required=True)
args = parser.parse_args()

AD_SERVER = 'GORA.Bjornholt.local'
AD_USER   = 'bjornholt\\administrator'
AD_PASS   = 'Admin123'
BASE_DN   = 'OU=TECH,OU=HR,OU=Bjornholt,DC=Bjornholt,DC=local'

try:
    server = Server(AD_SERVER, port=636, use_ssl=True, get_info=ALL)
    conn = Connection(server, user=AD_USER, password=AD_PASS, authentication=NTLM, auto_bind=True)

    conn.search(BASE_DN, f'(sAMAccountName={args.username})', attributes=['distinguishedName'])

    if not conn.entries:
        print(f"Bruker '{args.username}' ikke funnet.")
        sys.exit(1)

    dn = str(conn.entries[0].distinguishedName)

    conn.extend.microsoft.modify_password(dn, args.password)
    conn.modify(dn, {'pwdLastSet': [(MODIFY_REPLACE, [0])]})
    print(f"Passord tilbakestilt for '{args.username}'. Bruker må bytte ved neste innlogging.")

except Exception as e:
    print(str(e), file=sys.stderr)
    sys.exit(1)

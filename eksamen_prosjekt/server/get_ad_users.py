import json
import sys
from ldap3 import Server, Connection, ALL, NTLM, SUBTREE

AD_SERVER = 'GORA.Bjornholt.local'
AD_USER   = 'bjornholt\\administrator'
AD_PASS   = 'Admin123'
BASE_DN   = 'OU=TECH,OU=HR,OU=Bjornholt,DC=Bjornholt,DC=local'

try:
    server = Server(AD_SERVER, get_info=ALL)
    conn = Connection(server, user=AD_USER, password=AD_PASS, authentication=NTLM, auto_bind=True)

    conn.search(
        BASE_DN,
        '(objectClass=user)',
        search_scope=SUBTREE,
        attributes=['cn', 'sAMAccountName', 'mail', 'userAccountControl', 'distinguishedName']
    )

    users = []
    for entry in conn.entries:
        uac = int(entry.userAccountControl)
        users.append({
            'cn': str(entry.cn),
            'username': str(entry.sAMAccountName),
            'email': str(entry.mail) if entry.mail else '',
            'aktiv': (uac & 2) == 0,
            'dn': str(entry.distinguishedName)
        })

    print(json.dumps(users))

except Exception as e:
    print(json.dumps({'error': str(e)}), file=sys.stderr)
    sys.exit(1)

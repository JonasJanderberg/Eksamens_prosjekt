from ldap3 import Server, Connection, ALL, NTLM, MODIFY_REPLACE, MODIFY_ADD
import argparse

# Parse command-line arguments
parser = argparse.ArgumentParser(description="Create or delete an AD user.")
parser.add_argument('--action', required=True, choices=['create', 'delete'], help='Action: create or delete')
parser.add_argument('--username', required=True, help='Username (without domain)')
parser.add_argument('--password', help='Password (only required when creating)')
parser.add_argument('--type', help='User type: Student, Ny_ansatt, Ekstern (only for create)')
args = parser.parse_args()

# AD connection settings
AD_SERVER = 'GORA.Bjornholt.local'
AD_USER = 'bjornholt\\administrator'
AD_PASS = 'Admin123'
BASE_DN = 'OU=TECH,OU=HR,OU=Bjornholt,DC=Bjornholt,DC=local'

# Group mappings
group_map = {
    "ny_ansatt": "CN=Bjornholt_Ansatte,OU=TECH,OU=HR,OU=Bjornholt,DC=Bjornholt,DC=local",
    "ekstern": "CN=Bjornholt_Ekstern,OU=TECH,OU=HR,OU=Bjornholt,DC=Bjornholt,DC=local",
    "student": "CN=Bjornholt_Elever,OU=TECH,OU=HR,OU=Bjornholt,DC=Bjornholt,DC=local",
}

# Connect to Active Directory
server = Server(AD_SERVER, get_info=ALL)
conn = Connection(server, user=AD_USER, password=AD_PASS, authentication=NTLM, auto_bind=True)

# Distinguished Name (DN)
dn = f'CN={args.username},{BASE_DN}'

if args.action == 'create':
    if not args.password or not args.type:
        print("Missing --password or --type for create.")
        exit(1)

    user_type = args.type.strip().lower()
    group_dn = group_map.get(user_type)

    if not group_dn:
        print(f"Unknown user type '{args.type}'.")
        exit(1)

    # Check if user already exists
    if conn.search(BASE_DN, f"(sAMAccountName={args.username})"):
        print(f"ℹUser '{args.username}' already exists.")
    else:
        attrs = {
            'objectClass': ['top', 'person', 'organizationalPerson', 'user'],
            'cn': args.username,
            'sAMAccountName': args.username,
            'userPrincipalName': f"{args.username}@Bjornholt.local",
        }

        if conn.add(dn, attributes=attrs):
            print(f"User '{args.username}' created.")

            conn.extend.microsoft.modify_password(dn, args.password)
            conn.modify(dn, {'pwdLastSet': [(MODIFY_REPLACE, [0])]})

            if conn.modify(group_dn, {'member': [(MODIFY_ADD, [dn])]}):
                print(f"Added user to group: {group_dn}")
            else:
                print(f"Could not add user to group: {conn.result}")
        else:
            print(f"Failed to create user: {conn.result}")

elif args.action == 'delete':
    if conn.search(BASE_DN, f"(sAMAccountName={args.username})"):
        if conn.delete(dn):
            print(f"User '{args.username}' deleted.")
        else:
            print(f"Failed to delete user: {conn.result}")
    else:
        print(f"User '{args.username}' does not exist.")
 
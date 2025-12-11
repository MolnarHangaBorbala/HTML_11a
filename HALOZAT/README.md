  ###7. SSH elérés + helyi hitelesítés + domain + RSA kulcs + SSH v2
   
    conf t
    hostname OSLO
    ip domain-name cisco.com
    
    username OSLOadmin privilege 15 secret OSLOpass
    
    crypto key generate rsa

Ha rákérdez a kulcsméretre, add meg:

    How many bits in the modulus [512]: 1024


    ip ssh version 2
    
    line vty 0 4
    transport input ssh
    login local
    exit

  ###8. Privilegizált mód (enable mode) jelszó: OSLOena
   
    enable secret OSLOena

  ###9. Konzol jelszó: OSLOcon0, belépéskor kérje

    line console 0
    password OSLOcon0
    login
    exit
    
  ###10. Statikus forgalomirányítás NEXT HOP alapján

  Általános forma (statikus route next-hop-pal):

    ip route [cél-hálózat] [alhálózati maszk] [next-hop IP]

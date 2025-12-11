**1.Lépés: Szerverbe modul berakása**
    **PT-HOST-NM-1CGE**
    
    | Helyzet                                | Modul javaslat                                 |
    | -------------------------------------- | ---------------------------------------------- |
    | Server0 – másik eszköz is FastEthernet | `PT-HOST-NM-1CFE`                              |
    | Server0 – másik eszköz GigabitEthernet | `PT-HOST-NM-1GE`                               |
    | Nem tudod biztosan?                    | `PT-HOST-NM-1CFE` (biztonságos alapértelmezés) |

---
**2.Lépés: Összekötés**

   1. PC0 ↔ Router0
      Kábel: Copper Straight-Through
      Portok:
        PC0: FastEthernet0
        Router0: FastEthernet0/0

   2. Router0 ↔ Cluster0 (ISP)
      Kábel: Copper Straight-Through
      Portok:
        Router0: FastEthernet0/1
        Cluster0: Ethernet port (pl. FastEthernet1)

   3. Cluster0 ↔ Server1
      Kábel: Copper Straight-Through
      Portok:
        Cluster0: Ethernet port (pl. GigaEthernet)
        Server1: GigaEthernet0

---
**3.Lépés: IP-címek beállítása**
Eszközönkénti beállítások:

🖥️ PC0
*   IP-cím: 192.168.2.10
*   Subnet mask: 255.255.255.240
*   Default gateway: 192.168.2.1 (Router0 LAN interfésze)

🌐 Router0
FastEthernet0/0 (PC0 felé):
*   IP-cím: 192.168.2.1
*   Subnet mask: 255.255.255.240

FastEthernet0/1 (ISP/Cluster felé):
*   IP-cím: 192.168.1.1
*   Subnet mask: 255.255.255.252

☁️ Cluster0 (ISP szerep)
Általában csak egy "átmeneti eszköz", nem kell külön IP-címet konfigurálni, csak továbbítja a jelet. Viszont ha szükséges, az egyik portjára az alábbi IP-t add meg:
*   IP-cím: 192.168.1.2
*   Subnet mask: 255.255.255.252

🖥️ Server1
*   IP-cím: 192.168.1.2
*   Subnet mask: 255.255.255.252
*   Default gateway: 192.168.1.1 (Router0 WAN interfésze)

**4.Lépés: DHCP beállítása**

         Router> enable
         Router# configure terminal
   
   *! DHCP pool létrehozása
    
         Router(config)# ip dhcp pool CLUSTER_POOL
         Router(dhcp-config)# network 192.168.1.0 255.255.255.252
         Router(dhcp-config)# default-router 192.168.1.1
         Router(dhcp-config)# exit
   
   *! A poolhoz tartozó interfészen ne kérjen maga is DHCP-t
   
         Router(config)# interface FastEthernet0/1
         Router(config-if)# ip address 192.168.1.1 255.255.255.252
         Router(config-if)# no shutdown
         Router(config-if)# exit
   
   *! (Biztosításképp tiltsuk le az interfész saját DHCP igényét)
   
         Router(config)# no ip dhcp conflict logging

**Ágazati**

*   webserver(talán)
*   ISP
*   2 router - statikus
*   2 switch
*   IP-cím számítás
*   SSH

elmélet:
*   OSI
*   forgalom irányítás
*   OP rendszer

# Guida al Deployment - Artwoodarreda Studio

Questa guida descrive come pubblicare l'applicazione **Artwoodarreda Studio** in produzione.

L'applicazione è sviluppata in **Next.js** e utilizza il `localStorage` del browser per la persistenza dei dati dei progetti. Ciò significa che:
- Non è necessario configurare o mantenere un database (PostgreSQL, MongoDB, ecc.).
- I costi di hosting sono estremamente bassi o nulli.
- *Nota importante*: Poiché i dati risiedono nel browser dell'utente (consulente), l'eliminazione dei dati di navigazione rimuoverà i progetti locali creati da quel browser. Per i clienti che visualizzano le presentazioni (tramite link e password), le informazioni visualizzate provengono dai dati inclusi nel link o condivisi.

---

## Metodo 1: Pubblicazione su Vercel (Consigliato)
**Vercel** è la piattaforma creata dagli stessi sviluppatori di Next.js. Offre un deployment immediato, serverless, con HTTPS automatico ed è gratuito per progetti personali/professionali di piccole dimensioni.

### Passi per il rilascio:
1. Crea un account gratuito su [Vercel](https://vercel.com).
2. Carica questo codice su un repository Git privato (GitHub, GitLab o Bitbucket).
3. Nella dashboard di Vercel, clicca su **"Add New"** > **"Project"**.
4. Importa il repository del progetto.
5. Vercel rileverà automaticamente che si tratta di un'applicazione Next.js.
6. Clicca su **"Deploy"**.
7. In meno di un minuto, l'app sarà pubblicata con un dominio pubblico gratuito (es. `artwoodarreda-studio.vercel.app`). Puoi successivamente collegare un dominio personalizzato (es. `studio.artwoodarreda.it`).

*La configurazione delle intestazioni di sicurezza è già pronta nel file `vercel.json`.*

---

## Metodo 2: Pubblicazione tramite Docker (VPS / Cloud)
Se preferisci ospitare l'applicazione sul tuo server (VPS con Ubuntu, Debian, ecc.) o su servizi PaaS come Render, Railway o Fly.io, puoi utilizzare il container Docker pre-configurato.

### Prerequisiti:
Assicurati che sul server siano installati **Docker** e **Docker Compose**.

### Passi per il rilascio:
1. Copia i file del progetto sul tuo server.
2. Costruisci l'immagine Docker:
   ```bash
   docker build -t artwoodarreda-studio .
   ```
3. Avvia il container esponendo la porta `3000`:
   ```bash
   docker run -d -p 3000:3000 --name artwoodarreda-studio --restart always artwoodarreda-studio
   ```
L'applicazione sarà ora accessibile all'indirizzo `http://IP_DEL_SERVER:3000`.

---

## Metodo 3: Deployment su VPS Standard con Node.js e PM2
Se vuoi avviare l'app direttamente sul server VPS senza Docker.

### Prerequisiti:
Installa **Node.js (versione 20 o superiore)** e **Nginx** sul server.

### Passi per il rilascio:
1. Copia il codice sul server.
2. Installa le dipendenze ed esegui la build:
   ```bash
   npm install --production
   npm run build
   ```
3. Installa **PM2** (process manager per mantenere l'app sempre attiva):
   ```bash
   sudo npm install -g pm2
   ```
4. Avvia l'applicazione con PM2:
   ```bash
   pm2 start npm --name "artwoodarreda-studio" -- start
   ```
5. Configura PM2 per avviarsi in automatico al reboot del server:
   ```bash
   pm2 startup
   pm2 save
   ```

### Configurazione Reverse Proxy (Nginx)
Configura Nginx per reindirizzare il traffico HTTP/HTTPS della porta 80/443 verso la porta 3000 del server Next.js. 

Esempio di configurazione del file `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 80;
    server_name studio.artwoodarreda.com; # Sostituisci col tuo dominio

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Abilita il sito e riavvia Nginx:
```bash
sudo systemctl restart nginx
```

Ti consigliamo di utilizzare poi **Certbot (Let's Encrypt)** per installare il certificato SSL gratuito (HTTPS) con il comando:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d studio.artwoodarreda.com
```

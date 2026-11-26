FROM node:24-bookworm-slim
WORKDIR /app
RUN chown node:node /app
ENV NODE_ENV=production PUPPETEER_SKIP_DOWNLOAD=true WHATSAPP_ENABLED=false WHATSAPP_SEND_APPROVED=false
COPY --chown=node:node package.json package-lock.json ./
USER node
RUN npm ci --omit=dev
COPY --chown=node:node src/ ./src/
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=4s --start-period=15s \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/api/health/ready').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
CMD ["node", "src/server.js"]

echo 'Running migrations...'
yarn prisma migrate deploy
echo 'Migrated!'


echo 'Starting Gr\'INP website...'
node build
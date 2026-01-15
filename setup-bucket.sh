#!/bin/bash

# Script per caricare CORS e policy sul bucket S3 Hetzner
# Utilizzo: ./setup-bucket.sh

ENDPOINT="https://nbg1.your-objectstorage.com"
BUCKET="traveltag-cms"

export AWS_ACCESS_KEY_ID="TO4GTKPITDJHH4RDFQTY"
export AWS_SECRET_ACCESS_KEY="swrcCMaTkZkw2dmLPEoJStVICPfTuksoOrQpDXmh"


echo "📦 Configurazione bucket S3: $BUCKET"
echo ""

# Carica CORS
echo "🔧 Caricamento configurazione CORS..."
aws s3api put-bucket-cors --bucket $BUCKET --cors-configuration file://cors.json --endpoint-url $ENDPOINT
if [ $? -eq 0 ]; then
  echo "✅ CORS configurato correttamente"
else
  echo "❌ Errore durante la configurazione CORS"
  exit 1
fi

echo ""

# Carica policy
# echo "🔧 Caricamento bucket policy..."
# aws s3api put-bucket-policy --bucket $BUCKET --policy file://bucket-policy.json --endpoint-url $ENDPOINT
# if [ $? -eq 0 ]; then
#   echo "✅ Policy configurata correttamente"
# else
#   echo "❌ Errore durante la configurazione policy"
#   exit 1
# fi

# echo ""

# # Carica lifecycle policy per auto-cleanup
# echo "🔧 Caricamento lifecycle policy (auto-cleanup video dopo 7 giorni)..."
# aws s3api put-bucket-lifecycle-configuration --bucket $BUCKET --lifecycle-configuration file://s3-lifecycle-policy.json --endpoint-url $ENDPOINT
# if [ $? -eq 0 ]; then
#   echo "✅ Lifecycle policy configurata correttamente"
# else
#   echo "❌ Errore durante la configurazione lifecycle policy"
#   exit 1
# fi

echo ""
echo "🎉 Configurazione completata!"

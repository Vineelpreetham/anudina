#!/bin/bash
echo "=== Staging changes ==="
git add .

echo "=== Committing changes ==="
git commit -m "Polished layout, cards, and removed emojis"

echo "=== Pushing to main branch ==="
git push origin main

echo "=== Done! ==="

# 02 · Voix off (ElevenLabs via Higgsfield)

L'objectif est une voix qui ne fait pas robot. On ne choisit pas à l'oreille au hasard : on fait passer une audition à plusieurs voix et on mesure.

## 1. Outils (serveur MCP Higgsfield)

Charge les outils par ToolSearch (`select:mcp__Higgsfield__balance,mcp__Higgsfield__models_explore,mcp__Higgsfield__list_voices,mcp__Higgsfield__generate_audio,mcp__Higgsfield__generate_audio_batch,mcp__Higgsfield__jobs_wait`).

1. `balance {}` : vérifie le solde.
2. `models_explore {"action": "get", "model_id": "text2speech_v2"}` : paramètres du modèle.
3. `list_voices {"size": 100}` : voix préréglées. Garde celles qui sont multilingues ou dans la langue visée, avec un timbre de narrateur posé.
4. Estimation du coût, sans générer :
   ```json
   {"params": {"model": "text2speech_v2", "variant": "elevenlabs", "voice_type": "preset",
               "voice_id": "<id>", "prompt": "<texte>", "get_cost": true}}
   ```
   Repère NOVA : 0,45 crédit pour 120 caractères.
5. Génération : `generate_audio_batch` avec `requests: [{index, params}, …]`, puis `jobs_wait {"jobs": [{index, job_id}], "timeout_seconds": 15}`. Recommence `jobs_wait` tant que ce n'est pas fini. Télécharge ensuite chaque URL rendue avec `curl -sSL -o audio/voix/<nom>.mp3`.

Sans Higgsfield : API ElevenLabs directe (modèle multilingue) avec la clé de l'utilisateur, ou demande-lui comment procéder. Ne prends jamais une voix système (espeak, say) : elle sonne robot, c'est exactement ce qu'on veut éviter.

## 2. Audition (4 à 6 voix)

- **Phrase test** : 15 à 20 mots, qui contiennent l'accroche, un nombre et une question. NOVA : « Mercredi, neuf heures. Vous devez décider si le projet est lancé dans trois semaines. Et si vous aviez la réponse… en cinq minutes ? »
- La même phrase pour toutes les voix, dans **un seul** `generate_audio_batch`.
- Mesure chaque essai : `python3 audio/analyser_voix.py` donne la langue, l'exactitude et le débit. Pour l'audition, adapte la table `PHRASES` ou utilise directement faster-whisper.
  - **Langue reconnue et probabilité** (`info.language_probability` ≥ 0,99) : un accent étranger fait baisser ce chiffre.
  - **Exactitude** : rapport de correspondance entre le texte attendu et la transcription.
  - **Débit** : viser 2,6 à 2,9 mots par seconde.
  - **Variation de hauteur** (écart-type de F0, par autocorrélation numpy ou `parselmouth`) : plus elle est grande, moins la voix est monotone.
  - **Pauses** : elles doivent tomber sur la ponctuation, pas au milieu d'un groupe de mots.
- Retiens la meilleure voix et note deux remplaçants. Résultat NOVA : « Julian » (`95429266-c0ac-4137-a209-63b8812b0f23`), français reconnu à 99,9 %, 2,8 mots par seconde, plus grande variation de hauteur des voix masculines. Remplaçants : Xavier (homme), Ines (femme).

## 3. Texte complet : deux prises en un appel

- Envoie le texte complet en **un seul `prompt`**, phrases séparées par des espaces, ponctuation conservée (« … », « ? », « : »). La prosodie est meilleure d'un seul tenant que phrase par phrase.
- **Deux prises identiques** dans le même `generate_audio_batch` (index 0 et 1). La synthèse varie d'une prise à l'autre : l'une respire mieux, prononce mieux un mot pivot.
- Enregistre `audio/voix/prise1.mp3` et `prise2.mp3`, puis lance `python3 audio/analyser_voix.py audio/voix/prise1.mp3 audio/voix/prise2.mp3`.
- **Choix de la prise** : exactitude la plus haute, aucune phrase avec une couverture < 0,6, mots pivots justes (NOVA : « Qui croire ? » et « Nova »), pas d'artefact (souffle métallique, mot avalé). Écoute les deux à l'endroit des mots pivots.
- Annonce la prise retenue et pourquoi, en une phrase.

## 4. Corriger une prononciation

- Réécris le mot comme il se prononce (« Nova », « Sec deux cent dix ») et régénère seulement si nécessaire : chaque prise coûte.
- Les nombres en chiffres sont parfois lus à l'anglaise : écris-les en lettres.
- Une pause manquante se règle par une ponctuation plus forte (point, ou « … »).

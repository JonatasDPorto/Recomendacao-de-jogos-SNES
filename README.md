# Recomendação de jogos SNES - Telegram
 
 ## Iniciando o bot
 
 ```
 node SNESBot.js
 ```

## Bot comandos

```
/start
/comandos
/info
/top10
/recomendados
/conteme "sua mensagem"
```
### Pesquisa

Pesquise jogos usando @GamesSNESbot.
Exemplo:
```
@GamesSNESbot fifa
```

##Sistema de Recomendação

Foi utlizado o metodo colaborativo User-based k-Nearest Neighbors.


## Analize de sentimento

O comando /conteme utiliza uma API fornecida pela Microsoft Azure Machine Learning Studio, contendo dados treinados para reconhecimendo de frase positivas e negativas.

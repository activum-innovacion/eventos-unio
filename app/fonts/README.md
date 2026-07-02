# Fuentes locales — Nexa

La interfaz usa **Montserrat** (cargada desde Google Fonts, ya funciona).

**Nexa** no está en Google Fonts (es de pago), así que para usarla en los
titulares necesito sus ficheros. Cuando los tengas del kit de marca de Unió,
déjalos aquí con estos nombres (formato **.woff2** ideal, o .otf/.ttf):

```
app/fonts/Nexa-Heavy.woff2      (o Nexa-Bold)
app/fonts/Nexa-Regular.woff2
```

Avísame y los conecto con `next/font/local` a la variable `--font-nexa`
(los titulares la usarán automáticamente; ya está preparado en
`app/globals.css` con Montserrat como reserva).

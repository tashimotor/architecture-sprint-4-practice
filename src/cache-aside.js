import express from 'express';
import fetch from 'node-fetch';
import {createClient} from 'redis';

const client = await createClient({url: 'redis://redis:6379'})
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

// извлечение данных
async function getCountries() {

    const response = await fetch(`https://restcountries.com/v3.1/all?fields=name,flags`);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return await response.json();
}

const app = express();
app.get('/countries', async (req, res) => {
    try {
        // попробуем извлечь данные о странах из кеша
        let countries = null;
        try {
            // попробуем извлечь данные о странах из кеша
            countries = await client.get('cache-aside-countries');
        } catch (err) {
            console.log(err);
        }
        // если кеш пуст, извлекаем данные из хранилища
        if (countries == null) {
            countries = await getCountries();
            await client.set('cache-aside-countries', JSON.stringify(countries));
        }

        res.status(200).send(JSON.stringify(countries));
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});


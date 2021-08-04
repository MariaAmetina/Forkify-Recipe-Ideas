import { async } from "regenerator-runtime";
import { TIMEOUT_SEC } from "./config.js";

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", //чтобы API знала, что получит JSON
          },
          body: JSON.stringify(uploadData), //превращаем новый рецепт в JSON
        })
      : fetch(url);

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`); //нужно в этом блоке создать ошибку, чтобы catch ее словил ниже
    return data;
  } catch (err) {
    throw err; //перекидывем ошибку здесь, чтобы она словилась в model.js
  }
};

/*
export const getJSON = async function (url) {
  try {
    const fetchPro = fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`); //нужно в этом блоке создать ошибку, чтобы catch ее словил ниже
    return data;
  } catch (err) {
    throw err; //перекидывем ошибку здесь, чтобы она словилась в model.js
  }
};

export const sendJSON = async function (url, uploadData) {
  //посылаем наш новый рецепт
  try {
    const fetchPro = fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", //чтобы API знала, что получит JSON
      },
      body: JSON.stringify(uploadData), //превращаем новый рецепт в JSON
    });

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};*/

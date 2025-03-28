export function regexTestMessage(phrase) {
    const matches = patterns.some((pattern) =>
        new RegExp(pattern, 'i').test(phrase)
    );

    return matches;
}

const subjects = `(?:.*?)(новичк(?:ам|у|ов|и)|начинающ(?:им|eму|ей)|урок|занятие|контакт(?:ы)?|покататься|позаниматься|найти|посерфить|(?:с[её]рф)?\\s*(?:-)?(?:школ[уы]|кэмп(?:а)?|тренер(?:а)?|инструктор(?:а|ов|ом)?))`;

const patterns = [
    `(ищу|ищем|подскажите|скажите|не подскажете|порекомендуйте|посоветуйте|дайте|нужен|нужна|нужны|может кто|(?:где\\s+)?найти|есть ли|ищется|подскажете|помогите|хочу найти|хотим|могу ли я|кто знает|нет ли)${subjects}`,
    `(может(?:е)?|кто(?:-|\\s*)?(?:то)?\\s+(может|знает))\\s+(подсказать|порекомендовать|посоветовать|дать)?${subjects}`,
    `(?:с кем|у кого|где\\s+(?:можно)?|хо(чу|тим|тел|телось|тела|тели)\\s*(бы)?)\\s*((\\S+\\s+){0,8})?(взять|найти|позаниматься|потренероваться|вспомнить|научиться|пройти обучение|обучиться)`,
    `кто\\s*(\\S+\\s*){0,4}?(обучает|проводит|тренерует|дает|может)\\s+(обучить|дать|провести|потренеровать)?`,
    `(нужен|нужна|нужны|есть)${subjects}`,
    `нужно\\s*(\\S+\\s*){0,4}?(обучить|дать|провести|потренеровать)`,
];

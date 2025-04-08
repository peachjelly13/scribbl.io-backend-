const defaultGameSettings = {
    players:8,
    language:'English',
    drawtime:80,
    rounds:3,
    gameMode:'Normal',
    wordCount:3,
    hints:2,
    customWords:[]
};

const gameSettings = {
    ...defaultGameSettings,
    customWords: JSON.stringify(defaultGameSettings.customWords)
}
// we do this because we use hset and it expects a string(primitive) and not non-primitive
//like an object
export {defaultGameSettings,gameSettings}
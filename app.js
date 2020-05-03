//const FFplay = require("ffplay"),
const MPlayer = require('mplayer'),
keypress = require('keypress');

const BOOKS_DIR = "./data/";
const VOICE_DIR = "./audio/";

const WORDS = {
    welcome: VOICE_DIR+"Bienvenue.wav",
    main_menu: VOICE_DIR+"Menu principale.wav",
    help: VOICE_DIR+"Besoin aide.wav",
    books:VOICE_DIR+"Liste des livres.wav",
    resume:VOICE_DIR+"Reprendre.wav",
    open_help: VOICE_DIR+"help.m4a",
    no_save: VOICE_DIR+"no-save.m4a",
}

let save = {
    book: null
}

let books;
var current_book = null;
var current_chapter = null;
var selector_level = 'menu';
const menu = ['resume','books','help'];
let current_menu_item = null;
var player = new MPlayer();
var player_status = null;
let playlist = [];
let playing = false;

player.on("stop", function(){
    playing = false;
    if(playlist.length > 0){
        let item = playlist.pop();
        player.openFile(item.file);
        if(item.opts.seek){
            player.seek(item.opts.seek);
        }
        playing = true;
    }
})/*
player.on("status", function(status){
    console.log(status);
    if(player_status == null){
        init();
    }
    player_status = status;
    if(player_status.playing == false && playlist.length > 0){
        player.openFile(playlist.pop());
    }
})*/
fs = require('fs');

function init(){
    process.stdin.on('keypress', detectArrows);
    var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    execute_command(line);
})
    load_library();
    welcome();
    console.log(books);
}

function detectArrows(ch, key) {
    console.log(key);
    process.stdin.pause();
    if (key && ["left","right","up","down"].indexOf(key.name)>-1) {
        execute_command(key.name);
    }
    process.stdin.resume();
}

function welcome(){
    play_sound_file(WORDS.welcome);
    play_sound_file(WORDS.main_menu);
}

function play_sound_file(path, opts) {
    opts = opts || {};
    /*if(time) {
       player = new FFplay(path,["-ss", time, "-autoexit", "-nodisp"]);
        
    } else {
        player = new FFplay(path,["-autoexit", "-nodisp"]); // Loads the sound file and automatically starts playing
    }*/
        if(opts.force){
            playlist = [];
        }
        playlist.push({file: path, opts: opts});
    if(!playing || opts.force) {
        let item = playlist.pop()
        player.openFile(item.file);
        if(item.opts.seek){
            player.seek(item.opts.seek);
        }
        playing = true;
    }
    /*if(player_status && player_status.playing){
    } else {
        player.openFile(path);
    }
    if(!player_status){
        player.pause();
    }*/
    /*if(callbacks.on_exit){
        player.proc.on('exit',callbacks.on_exit);
    }*/
    
}

function load_library() {
    
    // Books library initialization
    books = getDirectories();
    books = books.map(function (book) {
        var title = book;
        book = {
            title: title,
            chapters: getFiles(book)
        };
        return book;
    });
}

function getDirectories() {
    return fs.readdirSync(BOOKS_DIR).filter(function (file) {
      return fs.statSync(BOOKS_DIR + file).isDirectory();
    });
}

function getFiles(book) {
    return fs.readdirSync(BOOKS_DIR+book+'/').filter(function (file) {
      return !fs.statSync(BOOKS_DIR+book+'/'+file).isDirectory() && file !== "title.m4a";
    });
}

function execute_command(command){
    switch(command){
        case "up": {
            if(selector_level === 'menu'){
                switch(menu[current_menu_item]){
                    case 'help': {play_sound_file(WORDS.open_help);break;}
                    case 'resume': {load_previous_book();break;}
                    case 'books': {open_book_list();break;}
                }
            }
            
            break;
        }
        case "down": {break;}
        case "left": {
            if(selector_level === 'menu'){
                navigate_main_menu(-1);
            }
            break;
        }
        case "right": {
            if(selector_level === 'menu'){
                navigate_main_menu(1);
            }
            break;
        }
    }
}

function open_main_menu(){
    current_menu_item === null;
    selector_level = "menu";
}

function navigate_main_menu(direction){
    if(current_menu_item === null){
        current_menu_item = 0
    } else {
        current_menu_item = ((((current_menu_item+direction) % (menu.length))+menu.length)%menu.length);
    }
    play_sound_file(WORDS[menu[current_menu_item]]);
}

function load_previous_book(){
    if(save.book){
        //TO-DO
    } else {
        play_sound_file(WORDS.no_save);
    }
}
function open_book_list(){
    selector_level = "books";
    play_sound_file(BOOKS_DIR+books[0].title+'/title.m4a');
}

init();
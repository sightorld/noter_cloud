import { createStore } from "vuex";
import router from "../router";
import axios from "axios";

var MD5 = require('md5.js');

export default createStore({
  state: {
    connected: false,
    backend: 'https://noter-server.herokuapp.com',
    logged_in: false,
    email: '',
    nickname : '',
    notes: {
      'new': {
        id: "new",
        title: '',
        content: '',
        date: '',
        alert_email: [
        ],
        alert_time: new Date(),
      },
    },
    notes_array: [
      'new'
    ],
  },
  mutations: {
    SET_CONNECT(state, action) {
      state.connected = action;
    },
    LOG_OUT(state){
      state.logged_in = false;
      state.notes = {
          'new': {
          id: "new",
          title: '',
          content: '',
          date: '',
          alert_email: [],
          alert_time: '',
        },
      },
      state.email = '';
      state.nickname = '';
      state.notes_array = ['new'];
    },
    LOGIN_SUCCEEDED(state, action){
      state.email = action.email.toLowerCase();
      state.nickname = action.nickname;
      state.logged_in = true;
    },
    ADD_NEW_NOTE(state, action){
      state.notes_array.splice(0, 0, action.id);
      state.notes[action.id] = action;
      let i = state.notes[action.id].alert_email.indexOf(state.email);
      state.notes[action.id].alert_email.splice(i, 1);
    },
    EDIT_NOTE(state, action){
      state.notes[action.id].title = action.title;
      state.notes[action.id].content = action.content;
      state.notes[action.id].alert_email = action.alert_email;
      state.notes[action.id].alert_time = action.alert_time;
    },
    CLEAR_NOTES(state){
      for (let prop in state.notes) {
        if (prop != 'new') {
          delete state.notes[prop];
        }
      }
    },
    DELETE_NOTE(state, action){
      var index = state.notes_array.indexOf(action.id);
      if (index !== -1) {
        state.notes_array.splice(index, 1);
      };
      delete state.notes[action.id];
    },
    NEW_NICKNAME(state, action) {
      state.nickname = action.nickname;
    },
  },
  actions: {
    CONNECTION_CHECK: async(context)=>{
      if (context.state.connected)
        return;
      console.log(context.state.backend + "/api/connect")
      const response = await axios.post(context.state.backend + "/api/connect");
      if (!response.data.success) {
        alert("Ошибка присоединения к серверу!");
      } else {
        context.commit("SET_CONNECT", true);
        if (localStorage.email && localStorage.session) {
          const req2 = {
            "email" : localStorage.email.toLowerCase(),
            "session" : localStorage.session
          }
          const response2 = await axios.post(context.state.backend + "/api/autoLogin", req2);
          if (response2.data.success){
            context.commit("LOGIN_SUCCEEDED", {'email' : localStorage.email.toLowerCase(), 'nickname' : response2.data.nickname});
            router.push("/notes");
          } else {
            localStorage.email = '';
            localStorage.session = '';
            alert("Сессия истекла, зайдите снова!");
          }
        }
      }
    },
    LOGIN: async(context, payload)=>{
      const req = {
        "email" : payload.email.toLowerCase()
      }
      const response = await axios.post(context.state.backend + "/api/getOneTimeToken",req);
      const hash = new MD5().update(`${payload.email}:${payload.password}`).digest('hex');
      const token = new MD5().update(`${response.data.salt}>>${hash}`).digest('hex');
      const req2 = {
        "email" : payload.email.toLowerCase(),
        "hash" : token
      }
      const response2 = await axios.post(context.state.backend + "/api/loginWithOneTimeToken", req2);
      if (response2.data.success){
        context.commit("LOGIN_SUCCEEDED", {'email' : payload.email.toLowerCase(), 'nickname' : response2.data.nickname});
        localStorage.email = payload.email.toLowerCase();
        localStorage.session = response2.data.session;
        router.push("/notes");
      }
      else {
        localStorage.email = '';
        localStorage.session = '';
        alert("Ошибка при входе!");
      }
    },
    REGISTER: async(context, payload)=>{
      const req = {
        "email" : payload.email.toLowerCase(),
        "password" : payload.password
      }
      const response = await axios.post(context.state.backend + "/api/createAccount", req)
      if (!response.data.success) {
        alert("Такой логин уже используется (или просто ошибка!)");
      } else {
        alert("Аккаунт создан!!!")
      }
    },
    LOAD_NOTES: async(context)=>{
      context.commit('CLEAR_NOTES');
      if (!context.state.logged_in)
        return;
      const req = {
        "email" : context.state.email.toLowerCase(),
      }
      const response = await axios.post(context.state.backend + "/api/getNotes", req)
      for (const index in response.data.notes){
        context.commit("ADD_NEW_NOTE", response.data.notes[index]);
      };
    },
    SEND_NEW_NOTE: async(context, payload)=>{
      if (!context.state.logged_in)
        return;
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      var t = new Date(payload.alert_time + 'Z').getTime();
      payload.alert_time = (new Date(t + tzoffset)).toISOString();
      payload.alert_time = payload.alert_time.substring(0, payload.alert_time.length - 5);
      const req = {
        "email" : context.state.email.toLowerCase(),
        "note" : {
          "title" : payload.title,
          "content" : payload.content,
          "alert_email" : [ context.state.email, ...payload.alert_email
          ],
          "alert_time" : payload.alert_time + 'Z',
        }
      }
      const response = await axios.post(context.state.backend + "/api/newNote", req)
      if (!response.data.success){
        alert("Ошибка при создании новой заметки!");
      } else{
        context.commit("ADD_NEW_NOTE", response.data.note);
      }
    },
    UPDATE_NOTE: async(context, payload)=>{
      if (!context.state.logged_in)
        return;
      let saveTime = payload.alert_time;
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      var t = new Date(payload.alert_time + 'Z').getTime();
      payload.alert_time = (new Date(t + tzoffset)).toISOString();
      payload.alert_time = payload.alert_time.substring(0, payload.alert_time.length - 5);
      const req = {
        "email" : context.state.email.toLowerCase(),
        "id" : payload.id,
        "title" : payload.title,
        "content" : payload.content,
        "alert_email" : [ context.state.email, ...payload.alert_email
        ],
        "alert_time" : payload.alert_time + 'Z',
      }
      const response = await axios.post(context.state.backend + "/api/updateNote", req);
      payload.alert_time = saveTime;
      if (!response.data.success){
        alert("Ошибка при изменении заметки!");
      }
      else {
        context.commit("EDIT_NOTE", payload);
      }
    },
    DELETE_NOTE: async(context, payload)=>{
      if (!context.state.logged_in)
        return;
      const req = {
        "email" : context.state.email.toLowerCase(),
        "id" : payload.id
      }
      const response = await axios.post(context.state.backend + "/api/removeNote", req)
      if (!response.data.success){
        alert("Ошибка при удалении заметки!");
      } else {
        context.commit("DELETE_NOTE", payload);
      }
    },
    LOGOUT: async(context)=>{
      if (!context.state.logged_in)
        return;
        const req = {
          "email" : context.state.email.toLowerCase()
        }
      const response = await axios.post(context.state.backend + "/api/logout", req)
      if (!response.data.success){
        alert("Ошибка при выходе из аккаунта!");
      } else {
        context.commit("LOG_OUT");
        localStorage.email = '';
        localStorage.session = '';
        router.push("/login")
      }
    },
    EDIT_NICKNAME: async(context, payload)=>{
      if (!context.state.logged_in)
        return;
      const req = {
        "email" : context.state.email.toLowerCase(),
        "nickname" : payload.nickname
      }
      const response = await axios.post(context.state.backend + "/api/setPseudonym", req)
      if (!response.data.success){
        alert("Ошибка при изменении никнейма!");
      } else {
        context.commit("NEW_NICKNAME", req);
      }
    },
  },
});

// function getDateTime() {
//   var now = new Date();
//   var year = now.getFullYear();
//   var month = now.getMonth() + 1;
//   var day = now.getDate();
//   var hour = now.getHours();
//   var minute = now.getMinutes();
//   var second = now.getSeconds();
//   if (month.toString().length == 1) {
//     month = "0" + month;
//   }
//   if (day.toString().length == 1) {
//     day = "0" + day;
//   }
//   if (hour.toString().length == 1) {
//     hour = "0" + hour;
//   }
//   if (minute.toString().length == 1) {
//     minute = "0" + minute;
//   }
//   if (second.toString().length == 1) {
//     second = "0" + second;
//   }
//   var dateTime =
//     `${year}-${month}-${day} ${hour}:${minute}:${second}.000 +0300` 
//   return dateTime;
// }

<template>
    <header class="notes__header">
        <img :src="logosrc" alt="logo" class="logo-notes">
        <div class="login-related" v-if="$store.state.logged_in">
            <div class="related-align">
                <h3 v-if="!editNick" @click="editNick = true;">{{$store.state.nickname ? $store.state.nickname : $store.state.login}}</h3>
                <input v-if="editNick" type="text" id="nickEdit" :value="$store.state.nickname ? $store.state.nickname : $store.state.login" @keydown.enter="saveNickname">
                <button v-if="editNick" type="button" class="svg-buttons save" @click="saveNickname">
                    <img :src="savesrc" alt="Сохр." title="Сохранить никнейм">
                </button><button v-if="editNick" type="button" class="svg-buttons save" @click="editNick = false">
                    <img :src="cancelsrc" alt="Отм." title="Отменить изменения">
                </button>
                <button type="button" class="svg-buttons" @click="logout">
                    <img :src="logoutsrc" alt="Выход" title="Выход из учетной записи">
                </button>
            </div>
        </div>
    </header>
    <main class="wrapper_notes" v-if="$store.state.logged_in" @click="editNick? editNick = false : ''">
        <div class="wrapper-grid" v-if="!selectedNote">
            <template v-for="note in notes_id" :key="$store.state.notes[note].id" >
                <div class="single-note" v-if="$store.state.notes[note].id !== 'new'" @click="setActiveNote(note)">
                    <h6>{{$store.state.notes[note].title}}</h6>
                    <p>Создано {{$store.state.notes[note].date}}</p>
                </div>
                <div class="single-note" v-else @click="setActiveNote(note)">
                    <div class="add-align">
                        <img :src="addsrc" alt="Новая заметка">
                    </div>
                </div>
            </template>
        </div>
        <div class="selected-note" v-else-if="selectedNote">
            <div class="top-selected">
                <div class="related-align-left">
                    <button type="button" class="svg-buttons" @click="selectedNote=''; editMode = false; newEmailList = []; mobileLeftPage = true">
                        <img :src="minussrc" alt="Скрыть" title="Вернуться к заметкам">
                    </button>
                </div>
                <h3 v-if="!editMode">{{$store.state.notes[selectedNote].title}}</h3>
                <textarea v-else-if="editMode" :value="newTitle" class="ta" id="taTitle" placeholder="Измените название..." @change="changeTitle"></textarea>
                <div class="related-align-right" >
                    <button type="button" class="svg-buttons" @click="saveChanges" v-if="editMode">
                        <img :src="savesrc" alt="Сохранить" title="Сохранить изменения">
                    </button>
                    <button type="button" class="svg-buttons" @click="discardChanges" v-if="editMode">
                        <img :src="cancelsrc" alt="Отменить" title="Отменить изменения">
                    </button>
                    <button type="button" class="svg-buttons" @click="deleteNote" v-if="editMode">
                        <img :src="deletesrc" alt="Удалить" title="Удалить заметку">
                    </button>
                    <button type="button" class="svg-buttons" @click="editMode = true" v-if="!editMode">
                        <img :src="editsrc" alt="Изменить" title="Изменить заметку">
                    </button>
                    <template v-if="mobileView">
                        <button type="button" class="svg-buttons" @click="mobileLeftPage = !mobileLeftPage">
                            <img :src="mobileLeftPage? nextsrc : backsrc" alt="Переход" title="Сменить страницу">
                        </button>
                    </template>
                </div>
            </div>
                <div class="editor">
                    <template v-if="!mobileView">
                        <div class="text-field">
                            <p v-if="!editMode">{{$store.state.notes[selectedNote].content}}</p>
                            <textarea v-else-if="editMode" :value="newContent" class="ta" id="taContent" placeholder="Измените описание..." @change="changeContent"></textarea>
                        </div>
                        <div class="alerts-field">
                            <div class="time-select">
                                <p>Оповестить </p>
                                <p v-if="!editMode"> {{alertTime}}</p>
                                <input type="datetime-local" :disabled="!editMode" v-if="editMode" id="clock" :value='newDate' :min='minDate' @change="changeDate">
                            </div>
                            <div class="email-select">
                                <p>Рассылка заметки по email</p>
                                <div class="email-line">
                                    <input type="text" class='email-input-field pattern-check' :value="$store.state.email"
                                        pattern="[^@\s]+@[^@\s]+\.[^@\s]+" disabled>
                                </div>
                                <div class="email-line" v-for="e of newEmailList" :key="e">
                                    <input type="text" placeholder="Введите email..." class='email-input-field pattern-check' :id='e'
                                        pattern="[^@\s]+@[^@\s]+\.[^@\s]+" :value="e" :disabled="e != selectedEmail || !editMode">
                                    <button type="button" @click="setEmail(e)" v-if="selectedEmail != e" v-show="editMode">
                                        <img :src="editsrc" alt="e">
                                    </button>
                                    <button type="button" @click="saveEmail" v-if="selectedEmail == e" v-show="editMode">
                                        <img :src="savesrc" alt="s">
                                    </button>
                                    <button type="button" @click="removeEmail(e)" v-show="editMode">
                                        <img :src="deletesrc" alt="d">
                                    </button>
                                </div>
                            </div>
                            <div class="email-line" v-if="editMode">
                                <input type="text" placeholder="Введите email..." class='email-input-field pattern-check'
                                    pattern="[^@\s]+@[^@\s]+\.[^@\s]+" v-model="newEmail" id="newE">
                                <button type="button" @click="addEmail">
                                    <img :src="savesrc" alt="s">
                                </button>
                                <button type="button" @click="newEmail = ''" v-if="newEmail">
                                    <img :src="deletesrc" alt="d">
                                </button>
                            </div>
                        </div>
                    </template> 
                    <template v-if="mobileView">
                        <div class="text-field" v-if="mobileLeftPage">
                            <p v-if="!editMode">{{$store.state.notes[selectedNote].content}}</p>
                            <textarea v-else-if="editMode" :value="newContent" class="ta" id="taContent" placeholder="Измените описание..." @change="changeContent"></textarea>
                        </div>
                        <div class="alerts-field" v-else-if="!mobileLeftPage">
                            <div class="time-select">
                                <p>Оповестить </p>
                                <p v-if="!editMode"> {{alertTime}}</p>
                                <input type="datetime-local" :disabled="!editMode" v-if="editMode" id="clock" :value='newDate' :min='minDate' @change="changeDate">
                            </div>
                            <div class="email-select">
                                <p>Расслыка заметки по email</p>
                                <div class="email-line">
                                    <input type="text" class='email-input-field pattern-check' :value="$store.state.email"
                                        pattern="[^@\s]+@[^@\s]+\.[^@\s]+" disabled>
                                </div>
                                <div class="email-line" v-for="e of newEmailList" :key="e">
                                    <input type="text" placeholder="Введите email..." class='email-input-field pattern-check' :id='e'
                                        pattern="[^@\s]+@[^@\s]+\.[^@\s]+" :value="e" :disabled="e != selectedEmail || !editMode">
                                    <button type="button" @click="setEmail(e)" v-if="selectedEmail != e" v-show="editMode">
                                        <img :src="editsrc" alt="e">
                                    </button>
                                    <button type="button" @click="saveEmail" v-if="selectedEmail == e" v-show="editMode">
                                        <img :src="savesrc" alt="s">
                                    </button>
                                    <button type="button" @click="removeEmail(e)" v-show="editMode">
                                        <img :src="deletesrc" alt="d">
                                    </button>
                                </div>
                            </div>
                            <div class="email-line" v-if="editMode">
                                <input type="text" placeholder="Введите email..." class='email-input-field pattern-check'
                                    pattern="[^@\s]+@[^@\s]+\.[^@\s]+" v-model="newEmail" id="newE">
                                <button type="button" @click="addEmail">
                                    <img :src="savesrc" alt="s">
                                </button>
                                <button type="button" @click="newEmail = ''" v-if="newEmail">
                                    <img :src="deletesrc" alt="d">
                                </button>
                            </div>
                        </div>
                    </template>
                </div>
            
        </div>
    </main>

</template>

<script>

export default {
    name: "NotesPage",
    data: () => ({
      logosrc: require('@/assets/noterapp.png'),
      editsrc: require('@/assets/editicon.svg'),
      logoutsrc: require('@/assets/logouticon.svg'),
      deletesrc: require('@/assets/deleteicon.svg'),
      addsrc: require('@/assets/addicon.svg'),
      cancelsrc: require('@/assets/cancelicon.svg'),
      savesrc: require('@/assets/saveicon.svg'),
      minussrc: require('@/assets/minusicon.svg'),
      nextsrc: require('@/assets/nexticon.svg'),
      backsrc: require('@/assets/backicon.svg'),
      selectedNote: '',
      selectedEmail: '',
      newEmailList: [],
      newEmail : '',
      newContent: '',
      newTitle: '',
      editMode: false,
      editNick: false,
      minDate: '',
      newDate: '',
      mobileLeftPage: true,
    }),
    mounted(){
        if (!this.$store.state.logged_in) {
            this.$router.push("/login");
        } else {
        // Запрос заметок
        this.$store.dispatch("LOAD_NOTES");
        var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        this.minDate = (new Date(Date.now() - tzoffset)).toISOString();
        this.minDate = this.minDate.substring(0, this.minDate.length - 5);
        this.newDate = this.minDate;
        }
    },
    methods: {
        changeDate(){
            this.newDate = document.getElementById('clock').value;
        },
        changeTitle(){
            this.newTitle = document.getElementById('taTitle').value;
        },
        changeContent(){
            this.newContent = document.getElementById('taContent').value;
        },
        setActiveNote(e){
            this.selectedNote=this.$store.state.notes[e].id; 
            this.newContent = this.$store.state.notes[e].content;
            this.newTitle = this.$store.state.notes[e].title;
            this.newEmailList = this.$store.state.notes[e].alert_email.slice();
            this.newDate = this.conv(this.$store.state.notes[e].alert_time);
            this.newEmail = '';
            if (e == 'new'){
                this.editMode = true;
            }
        },
        discardChanges(){
            this.mobileLeftPage = true;
            this.newContent = this.$store.state.notes[this.selectedNote].content;
            this.newTitle = this.$store.state.notes[this.selectedNote].title;
            this.newEmailList = this.$store.state.notes[this.selectedNote].alert_email.slice();
            this.newDate = this.conv(this.$store.state.notes[this.selectedNote].alert_time);
            this.editMode = false;
            this.newEmail = '';
        },
        conv(e){
            let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
            let tt = new Date(e);
            let t = (new Date(tt - tzoffset)).toISOString();
            return t.substring(0, t.length - 5);
        },
        setEmail(e){
            if (e == this.selectedEmail) {
                this.selectedEmail = '';
            } else {
                this.selectedEmail = e;
            }
        },
        saveEmail(){
            let e = document.getElementById(this.selectedEmail).value;
            if (e == this.$store.state.email){
                return;
            }
            if (e == this.selectedEmail) {
                this.selectedEmail = '';
            } else {
                if (this.newEmailList.includes(e)) {
                    alert('Email уже есть в списке оповещения')
                } else {
                    if (e.match(/[^@\s]+@[^@\s]+\.[^@\s]+/)) {
                        let i = this.newEmailList.indexOf(this.selectedEmail);
                        this.newEmailList.splice(i, 1);
                        this.newEmailList.push(e);
                    } else {
                        alert('Введён некорректный email');
                    }
                }
                this.selectedEmail = '';
            }
        },
        removeEmail(e) {
            if (this.selectedEmail) {
                this.selectedEmail = '';
            } 
            let i = this.newEmailList.indexOf(e);
            this.newEmailList.splice(i, 1);
        },
        addEmail(){
            let n = document.getElementById('newE').value;
            if (n == this.$store.state.email){
                return;
            }
            if (this.newEmailList.includes(n)) {
                    alert('Email уже есть в списке оповещения')
                } else {
                    if (n.match(/[^@\s]+@[^@\s]+\.[^@\s]+/)) {
                        this.newEmailList.push(n);
                    } else {
                        alert('Введён некорректный email');
                    }
                    this.newEmail = '';
            }
        },
        blurring(e){
            if (e.target.id !== 'saveBtn') {
                this.$nextTick(() => this.editNick = false)
            }
        },
        // Изменение ника
        saveNickname(){
            var newNick = document.getElementById('nickEdit').value;
            if (newNick == this.$store.state.nickname){
                alert("Ник совпадает с установленным");
                return;
            }
            this.$store.dispatch("EDIT_NICKNAME", {"nickname" : newNick});
            this.editNick = false;
        },
        // Выход из формы
        logout(){
            this.$store.dispatch("LOGOUT");
        },
        // Метод удаления записи
        deleteNote(){
            if (this.selectedNote == 'new') {
                alert("Не удаляйте то чего нет!!!!!!");
                return;
            }
            this.$store.dispatch("DELETE_NOTE", {"id" : this.selectedNote});
            this.selectedNote='';
            this.newEmailList = [];
            this.editMode= false;
        },
        // Новая запись и изменение
        saveChanges(){
            if (!this.selectedNote) {
                alert("Как ты сюда попал")
                return;
            }
            // Метод добавления записи
            if (!this.newTitle || !this.newContent) {
                alert("Не оставляйте пустых полей!");
                return;
            }
            if (this.selectedNote === 'new'){
                const req = {
                    "title" : this.newTitle,
                    "content" : this.newContent,
                    "alert_email" : this.newEmailList,
                    "alert_time" : this.newDate,
                }
                this.$store.dispatch('SEND_NEW_NOTE', req);
                this.selectedNote='';
                this.newEmailList = [];
                this.editMode= false;
            } 
            // Метод изменения записи
            else {
                if (this.newTitle == this.$store.state.notes[this.selectedNote].title 
                && this.newContent == this.$store.state.notes[this.selectedNote].content
                && this.newDate == this.conv(this.$store.state.notes[this.selectedNote].alert_time)
                && this.newEmailList == this.$store.state.notes[this.selectedNote].alert_email) {
                    alert("Внесите изменения в заметку");
                    return;
                }
                const req = {
                    "id" : this.selectedNote,
                    "title" : this.newTitle,
                    "content" : this.newContent,
                    "alert_email" : this.newEmailList,
                    "alert_time" : this.newDate,
                }
                this.$store.dispatch('UPDATE_NOTE', req);
                this.newEmailList = [];
                this.editMode= false;
                this.mobileLeftPage = true;
            }
        },
    },
    computed: {
        alertTime(){
            let t =  new Date(this.$store.state.notes[this.selectedNote].alert_time);
            if (typeof t.getMonth === 'function')
                return t.toLocaleDateString() + ' ' + t.toLocaleTimeString();
            else return '';
        },
        notes_id() {
            return this.$store.state.notes_array;
        },
        mobileView(){
            return this.$windowWidth < 750;
        },
    },
}
</script>

<style>
.notes__header {
    position: fixed;
    top:0;
    z-index: 5;
    width: 100%;
    height: 55px;
    padding: 0 10px 0 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: white;
    border-bottom: 3px solid rgb(141, 141, 141);
}
.svg-buttons{
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
}

.save {
    margin-right: 10px;
}

.login-related{
    align-items: center;
    display: grid;
}
.related-align{
    justify-self: center;
    display: flex;
    flex-direction: row;
}

.related-align-left{
    justify-self: center;
    display: flex;
}

.related-align-right{
    justify-self: center;
    display: flex;
}

.related-align > h3{
    margin-right: 10px;
    align-self: self-end;
}

.related-align  > input{
    margin: 0 10px;
    align-self: self-end;
    font-size: 24px;
    width:100%;
    font-size: 24px;
    font-weight: 400;
    border: none;
    border-bottom: 1px solid black;
}

.related-align > input:focus{
    outline: none;
}

.logo-notes{
  object-fit: contain;
  height: 50px;
}
.wrapper_notes{
  position: absolute;
  top: 55px;
bottom: 0;
  width: 100%;
  background-image: linear-gradient(
    40deg,
    hsl(311deg 100% 81%) 0%,
    hsl(303deg 83% 80%) 13%,
    hsl(293deg 83% 81%) 26%,
    hsl(283deg 90% 83%) 38%,
    hsl(274deg 96% 84%) 51%,
    hsl(265deg 100% 85%) 63%,
    hsl(257deg 100% 86%) 76%,
    hsl(248deg 100% 87%) 88%,
    hsl(240deg 100% 87%) 100%
    );
    overflow-y: auto;
}

.wrapper-grid{
    margin: 10px;
    grid-auto-rows: 200px;
    display: grid;
    position: relative;
    grid-column-gap: 10px;
    grid-row-gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.single-note{
    background-color: rgba(255, 255, 255, 0.507);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-radius: 15px;
    border: 2px solid rgba(122, 122, 122, 0.384);
    overflow-y: hidden;
    padding: 5px;
}
.time-select{
    padding-bottom: 5px;
    border-bottom: 1px solid grey;
    display: flex;
    font-size: 20px;
    margin: 10px 0;
}
.time-select > * {
    margin-left: 10px;
}
.email-select > p{
    font-size: 20px;
        text-align: left;
    margin-left: 20px;
}
.email-line{
    margin-top: 10px;
    display: flex;
}
.email-line > button {
    background: transparent;
    margin-left: 5px;
    border: none;
    width: 30px;
    height: 30px;
}
.selected-note{
    flex-direction: column;
    display: flex;
    position: fixed;
    border-radius: 15px;
    padding: 5px;
    top:55px;
    bottom:0;
    left:0;
    right:0;
    background-color: rgba(255, 255, 255, 0.507);
    border: 2px solid rgba(122, 122, 122, 0.384);
}
.editor{
    margin-top: 10px;
    display: flex;
    flex-direction: row;
    height: 100%;
}
.editor > div {
    border: 1px solid grey;
    border-radius: 12px;
    padding: 5px;
}
@media screen and (max-width: 749px){
    .editor > div {
    width: 100%;
    }
}

@media screen and (min-width: 750px){
    .editor > div {
    width: 50%;
    }
}

.alerts-field{
    margin-left: 5px;
}
.selected-note > p{
    padding: 5px;
    height: 100%;
    width: 100%;
    white-space: pre-wrap;
    text-align: left;
}

.top-selected{
    display: flex;
    flex-direction: row;
}

.top-selected > h3{
    margin-left: 10px;
    width:100%;
    align-self: center;
    text-align: center;
    font-size: 24px;
    font-weight: 400;
}
.text-field > p{
    font-size: 20px;
    text-align: left;
}
.ta{
    height: 100%;
    font-family: Roboto;
    width:100%;
    resize: none;
    font-size: 20px;
    font-weight: 500;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid grey;
    padding: 3px
}

.single-note > h6{
    font-size: 24px;
    font-weight: 400;
    height: 150px;
    overflow-y: hidden;
}

.single-note > p{
    text-align: right;
}
.add-align{
    z-index: 1;
    align-items: center;
    display: grid;
    width: 100%;
    height: 100%;
}
.add-align > img{
    width: 100px;
    height: 100px;
    justify-self: center;
}

@media screen and (max-width: 480px){
    .related-align > h3{
        font-size: 18px;
    }
    .related-align-left{
        flex-direction: column;
    }
    .related-align-left > .svg-buttons {
        margin-bottom: 10px;
    }
    .related-align-right{
        flex-direction: column;
    }
    .related-align-right > .svg-buttons {
        margin-bottom: 10px;
    }
}

@media screen and (min-width: 481px){
    .related-align > h3{
        font-size: 30px;
    }
    .related-align-left{
        flex-direction: row;
    }
    .related-align-left > .svg-buttons {
        margin-left: 10px;
    }
    .related-align-right{
        flex-direction: row;
    }
    .related-align-right > .svg-buttons {
        margin-left: 10px;
    }
}
</style>

<template>
    <main class="wrapper">
      <div class="join__container">
        <div class="form-join">
          <img :src="backg" alt="bac" class="email-back">
          <img :src="logosrc" alt="logo" class="email-logo">
          <form class="email-form" v-if="$store.state.connected">
            <div class="form-join-inputs">
                <div class="email-input">
                  <p class='email-input-title'>Email</p>
                  <input type="text" placeholder="Введите email..." v-model.trim="userNickname" class='email-input-field pattern-check'
                    id="loginField" pattern="[^@\s]+@[^@\s]+\.[^@\s]+">
                </div>
                <div class="email-input">
                  <p class='email-input-title'>Пароль</p>
                  <input type="password" placeholder="Введите пароль..." v-model.trim="userPassword" autocomplete="on" @keyup.enter="loginEvent" class='email-input-field'>
                </div>
                <div class="email-input">
                  <p v-if="!isLoginPage" class='email-input-title'>Повтор пароля</p>
                  <input type="password" placeholder="Пароль ещё раз..." v-model.trim="userPasswordRepeat" v-if="!isLoginPage" autocomplete="on" class='email-input-field'>
                </div>
            </div>
            <div class="form-join-buttons">
                <button type="button" class="join-button" @click="loginEvent" >{{loginButtonName}}</button>
                <button type="button" class="join-button" @click="switchToRegistration">{{returnButtonName}}</button>
            </div>
          </form>
          <div class="email-form fail" v-else>
              <p>Сервис временно недоступен :(</p>
          </div>
        </div>
      </div>
    </main>
</template>

<script>
export default {
    name: "Login",
    components: {
    },
    props: {
    },
    data: () => ({
      logosrc: require('@/assets/noterapp.png'),
      backg: require('@/assets/notepage.png'),
      isLoginPage: true,
      userNickname: '',
      userPassword: '',
      userPasswordRepeat: ''
    }),
    mounted(){
      this.$store.dispatch('CONNECTION_CHECK');
      sleep(5000).then(() => {
        if (!this.$store.state.connected)
          alert("Ошибка присоединения к серверу!")
      });
    },
    methods: {
        loginEvent(){
            if (!this.$store.state.connected) {
              alert("Отсутствует подключение к серверу!");
            }
            if (!this.userNickname) {
              alert("Заполните поле логин!");
              return;
            }
            // var l = document.getElementById('loginField');
            // if (!l.checkValidity()) {
            //   alert("Введите корректный email!");
            //   return;
            // }
            if (this.isLoginPage) {
                if (!this.userPassword){
                    alert("Заполните пароль!");
                    return;
                }                
                this.$store.dispatch('LOGIN', {'email' : this.userNickname.toLowerCase(), 'password' : this.userPassword});
            }
            else {
                if (!this.userPassword || !this.userNickname){
                    alert("Заполните пароль!");
                    return;
                }
                if (this.userPassword === this.userPasswordRepeat) {
                    this.$store.dispatch('REGISTER', {'email' : this.userNickname.toLowerCase(), 'password' : this.userPassword})
                } else {
                    alert("Пароли не совпадают!");
                    return;
                }
                this.switchToRegistration();
            }
        },
        switchToRegistration(){
            this.userNickname = '';
            this.userPassword = '';
            this.userPasswordRepeat = '';
            this.isLoginPage = !this.isLoginPage;
        }
    },
    computed:{
      loginButtonName(){
        if (this.isLoginPage){
            return 'Вход'
        } else{
            return 'Регистрация'
        }
      },
      returnButtonName(){
        if (this.isLoginPage){
            return 'Регистрация'
        } else{
            return 'Назад'
        }
      }
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
</script>

<style>
.pattern-check:valid:focus {
  color: green;
}

.pattern-check:invalid {
  color: red;
}

.fail {
  height: 200px;
}

.fail > p {
  padding-top: 100px;
}
.wrapper{
  display: flex;
  position: fixed;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
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
}

.email-logo{ 
  object-fit: contain;
  width: 280px;
  padding: 10px;
}

.email-back{
  object-fit: contain;
  position: absolute;
  width: 100%;
  top:-20px;
  bottom: 0;
  left:0;
  z-index: -1;
}

.form-join{
    position: relative;
    justify-self: center;
    border-radius: 32px;
    padding: 20px;
}

.email-input-title{
  text-align: left;
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 16px;
  padding-left: 15px;
  margin-bottom: 10px;
}

.email-input-field{
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 20px;
  border: none;
  border-bottom: 1px solid black;
  background-color: transparent;
  box-sizing: border-box;
  width: 280px;
  padding: 5px;
}

.email-input > input:focus{
    outline: none;
}

.form-join-inputs{
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    height: 220px;
}

.form-join-buttons{
    width: 300px;
    padding: 0 10px;
    margin: 0 auto;
    display: flex;
    justify-content: space-around;
}

.join-button{
  background: transparent;
  border-radius: 8px;
  border: 1px dashed grey;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 20px;
  color: black;
  padding: 10px;
  width:135px;
}

.join__container{
    align-items: center;
    display: grid;
    width: 100%;
    height: 100%;
}

</style>

<template>
<div class="wrapper">
  <div class="container">
    <div class="box">
      <img alt="loading circle" :src="loading" />
      <p>Redirecting to login page...</p>
    </div>
  </div>
</div>
</template>

<script>
import router from "../router";

export default {
  name: "Home",
  data: () => ({
    loading: require('@/assets/loading.gif'),
  }),
  mounted(){
    router.push("/login")
  },
};
</script>

<style>
.wrapper{
  display: flex;
  position: fixed;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

.container{
  z-index: 1;
  display: table;
  width: 100%;
  height: 100%;
}

.box{
  display: table-cell;
  vertical-align:middle;
  margin: auto;
  height: 200px;
  width: 200px;
}

</style>
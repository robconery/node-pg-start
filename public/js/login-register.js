var app = new Vue({ 
  el: '#authApp',
  data: {
    name: "Rob Conery",
    email: "rob@conery.io",
    password: "password",
    password_confirmation: "password",
    loginError: null,
    regError: null,
    errorMessage: null,
    title: "Login"
  },
  methods: {
    shakeModal : function(){
      $('#loginModal .modal-dialog').addClass('shake');
      setTimeout(function () {
        $('#loginModal .modal-dialog').removeClass('shake');
      }, 1000);
    },
    toggleRegistration: function() {
      $('.loginBox').fadeOut('fast', function () {
        $('.registerBox').fadeIn('fast');
        $('#registerToggle').fadeOut('fast', function () {
          $('#loginToggle').fadeIn('fast');
        });
      });
      this.title = "Register"
      this.errorMessage=null;
    },
    toggleLogin: function(){
      $('.registerBox').fadeOut('fast', function () {
        $('.loginBox').fadeIn('fast');
        $('#loginToggle').fadeOut('fast', function () {
          $('#registerToggle').fadeIn('fast');
        });
        this.title = "Login"
        this.errorMessage=null;
      });
    },
    popLogin: function(){
      this.toggleLogin();
      setTimeout(function(){
        $('#loginModal').modal('show');    
      }, 230);
    },
    logUserIn: function () {
      $.post("/auth/login", {
        username: this.email,
        password: this.password
      }).done(res =>{
        if(res.success) {
          location.reload();
        } else {
          this.loginError = res.message;
          this.shakeModal()
        }
      }).fail(err => {

        this.loginError = "Invalid username or password";
        this.shakeModal()
      });
    },
    registerUser: function () {
      $.post("/auth/register", {
        name: this.name,
        email: this.email,
        password: this.password,
        password_confirmation: this.password_confirmation
      }).done(res => {
        console.log(res);
        if(res.success) location.reload();
        else{
          this.errorMessage = res.message;
          this.shakeModal();
        }
        //location.reload();
      }).fail(err => {
        this.errorMessage = "There was a problem registering you :(";
        this.shakeModal();
      })
    }
  }
});

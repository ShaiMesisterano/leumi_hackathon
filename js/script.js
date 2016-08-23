window.App = {
    Models: {},
    Collections: {},
    Views: {},
    Helpers: {},
    Router: {},
    init: function () {
        this.initNavigation();
        this.initContact();
    },
    initNavigation: function () {
        var _this = this;
        $('.menu-item').click(function () {
            ($(this).index() === 0) && (_this.showBalance('BankAccount'));
            ($(this).index() === 1) && (_this.showBalance('CreditCard'));
            ($(this).index() === 2) && (_this.showBalance('SavingAccount'));
            ($(this).index() === 3) && (_this.showAchievement());
            ($(this).index() === 4) && (_this.showTrivia());
        });
    },
    initContact: function () {
        this.contact = new App.Models.ContactModel();
        var contactView = new App.Views.ContactView({
            model: this.contact
        });
        var statusView = new App.Views.StatusView({
            model: this.contact
        });
    },
    showBalance: function (transactionType) {
        var transactionCollection = new App.Collections.TransactionCollection();
        var balanceView = new App.Views.BalanceView({
            transactionType: transactionType,
            collection: transactionCollection
        });
        this.contact.addPoints(10);
    },
    showTrivia: function () {
        (this.currentTrivia) || (this.currentTrivia = 0);
        var triviaCollection = new App.Collections.TriviaCollection();
        var triviaView = new App.Views.TriviaView({
            currentTrivia: this.currentTrivia,
            collection: triviaCollection
        });
    },
    showAchievement: function(){
        var transactionCollection = new App.Collections.TransactionCollection();
        var achievementView = new App.Views.AchievementView({
            collection: transactionCollection
        });
    }
};
/* Models */
App.Models.ContactModel = Backbone.Model.extend({
    defaults: {
        num: 0,
        name: "",
        totalPoints: 0
    },
    url: "data/contact.json",
    addPoints: function (addedPoints) {
        var _totalPoints = this.get('totalPoints');

        this.set('totalPoints', _totalPoints + addedPoints);
    }
});
App.Models.TransactionModel = Backbone.Model.extend({
    defaults: {
        contact: null,
        type: "",
        category: "",
        name: "",
        amount: 0,
        fromDate: 0, // Format: Unix Timestamp
        toDate: 0 // Format: Unix Timestamp
    }
});
App.Models.ProductModel = Backbone.Model.extend({
    defaults: {
        contact: null,
        type: "",
        name: ""
    }
});
App.Models.AchievementModel = Backbone.Model.extend({
    defaults: {
        contact: null,
        name: "",
        addedPoints: 0
    }
});
App.Models.BadgeModel = Backbone.Model.extend({
    defaults: {
        contact: null,
        name: ""
    }
});
App.Models.TriviaModel = Backbone.Model.extend({
    defaults: {
        contact: null,
        question: "",
        correct: false
    }
});
/* Collections */
App.Collections.TransactionCollection = Backbone.Collection.extend({
    model: App.Models.TransactionModel,
    url: "data/transaction.json"
});
App.Collections.ProductCollection = Backbone.Collection.extend({
    model: App.Models.ProductModel,
    url: "data/product.json"
});
App.Collections.AchievementCollection = Backbone.Collection.extend({
    model: App.Models.AchievementModel,
    url: "data/achievement.json"
});
App.Collections.BadgeCollection = Backbone.Collection.extend({
    model: App.Models.BadgeModel,
    url: "data/badge.json"
});
App.Collections.TriviaCollection = Backbone.Collection.extend({
    model: App.Models.TriviaModel,
    url: "data/trivia.json"
});
/* Views */
App.Views.ContactView = Backbone.View.extend({
    el: '.contact',
    template: _.template($('.contact_template').html()),
    initialize: function () {
        _.bindAll(this, "render");
        this.model.bind('change', this.render);
        this.model.fetch().then(this.render);
    },
    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
    }
});
App.Views.StatusView = Backbone.View.extend({
    el: '.status',
    template: _.template($('.status_template').html()),
    initialize: function () {
        _.bindAll(this, "render");
        this.model.bind('change', this.render);
        this.model.fetch().then(this.render);
    },
    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
    }
});
App.Views.BalanceView = Backbone.View.extend({
    el: '.details',
    template: _.template($('.balance_template').html()),
    events: {
        'click .close': 'close'
    },
    initialize: function (options) {
        var _this = this,
            _transactionType = options.transactionType;

        this.collection.fetch().then(function () {
            _this.collection = _this.collection.where({type: _transactionType});
            _this.$el.append(_this.template(_this.collection));
        });
        this.$el.show();
    },
    close: function () {
        this.$el.text('');
        this.$el.hide();
    }
});
App.Views.TriviaView = Backbone.View.extend({
    el: '.details',
    template: _.template($('.trivia_template').html()),
    events: {
        'click .no': function () {
            this.checkAnswer(false);
        },
        'click .yes': function () {
            this.checkAnswer(true);
        },
        'click .close': 'close'
    },
    initialize: function () {
        var _this = this;

        this.collection.fetch().then(function () {
            _this.trivia = _this.collection.at(App.currentTrivia);
            console.log(_this.collection.length, App.currentTrivia);
            (_this.collection.length > App.currentTrivia + 1) && (App.currentTrivia = App.currentTrivia + 1);
            _this.$el.html(_this.template(_this.trivia.toJSON()));
        });
        this.$el.show();
    },
    checkAnswer: function (answer) {
        (answer) && (this.trivia.get('correct')) && (App.contact.addPoints(100));
        (!answer) && (!this.trivia.get('correct')) && (App.contact.addPoints(100));
        this.close();
    },
    close: function () {
        this.$el.html('');
        this.$el.hide();
        this.$el.off();
    }
});
App.Views.AchievementView = Backbone.View.extend({
    el: '.details',
    template: _.template($('.achievement_template').html()),
    events: {
        'click .close': 'close'
    },
    initialize: function () {
        var _this = this;

        this.collection.fetch().then(function () {
            _this.trivia = new Backbone.Collection();
            _this.$el.html(_this.template(_this.trivia.toJSON()));
        });
        this.$el.show();
    },
    close: function () {
        this.$el.html('');
        this.$el.hide();
        this.$el.off();
    }
});
/* Helpers */
App.Helpers.DateConverter = function (unix_timestamp) {
    var locale = "he-IL";
    return new Date(unix_timestamp * 1000).toLocaleDateString(locale);
};
App.Helpers.FormatAmount = function (val) {
    while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    }
    return val;
};
App.Helpers.Logger = {
    log: function (data) {
        console.log(data);
    }
};
/* Router */
App.Router = Backbone.Router.extend({
    routes: {
        "": "init"
    },
    init: function () {
        App.init();
    }
});

var router = new App.Router();
Backbone.history.start();
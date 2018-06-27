<template>
    <div>
        <nav-header></nav-header>
        <nav-bread><span>Goods</span></nav-bread>
        <div class="accessory-result-page accessory-page">
            <div class="container">
                <div class="filter-nav">
                    <span class="sortby">Sort by:</span>
                    <a href="javascript:void(0)" class="default cur">Default</a>
                    <a href="javascript:void(0)" class="price" @click="sortGoods">
                        Price 
                        <svg class="icon icon-arrow-short">
                            <use xlink:href="#icon-arrow-short"></use>
                        </svg>
                    </a>
                    <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
                </div>
                <div class="accessory-result">
                    <!-- filter -->
                    <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show':filterBy}">
                        <dl class="filter-price">
                        <dt>Price:</dt>
                        <dd><a href="javascript:void(0)" v-bind:class="{'cur':priceChecked=='all'}" @click="setPriceFilter('all')">All</a></dd>
                        <dd v-for="(item,index) in priceFilter" >
                            <a href="javascript:void(0)" v-bind:class="{'cur':priceChecked==index}" @click="setPriceFilter(index)">{{item.startPrice}} - {{item.endPrice}}</a>
                        </dd>
                        </dl>
                    </div>
                    <!-- search result accessories list -->
                    <div class="accessory-list-wrap">
                        <div class="accessory-list col-4">
                            <ul>
                                <li v-for="(item,index) in goodsList">
                                    <div class="pic">
                                        <a href="#"><img v-lazy="'/static/'+item.productImage" alt=""></a>
                                    </div>
                                    <div class="main">
                                        <div class="name">{{item.productName}}</div>
                                        <div class="price">{{item.salePrice}}</div>
                                        <div class="btn-area">
                                        <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div v-infinite-scroll="loadMore" 
                                 infinite-scroll-disabled="busy" 
                                 infinite-scroll-distance="30">
                                <img src="./../../static/loading-svg/loading-spinning-bubbles.svg" v-show="loading">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
            <p slot="message">
                请先登录,否则无法加入到购物车中!
            </p>
            <div slot="btnGroup">
                <a class="btn btn--m" href="javascript:;" @click="mdShow = false">关闭</a>
            </div>
        </modal>
        <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
            <p slot="message">
            <svg class="icon-status-ok">
                <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
            </svg>
            <span>加入购物车成!</span>
            </p>
            <div slot="btnGroup">
            <a class="btn btn--m" href="javascript:;" @click="mdShowCart = false">继续购物</a>
            <router-link class="btn btn--m btn--red" href="javascript:;" to="/cart">查看购物车</router-link>
            </div>
        </modal>
        <div class="md-overlay" v-show="overLayFlag" @click="closeFilterPop"></div>
        <nav-footer></nav-footer>
    </div>
</template>

<script>
import './../assets/css/base.css'
import './../assets/css/product.css'
import NavHeader from '@/components/NavHeader'
import NavFooter from '@/components/NavFooter'
import NavBread from '@/components/NavBread'
import Modal from './../components/Modal'
import axios from 'axios'

export default {
    data(){
        return{
            goodsList: [],
            priceFilter:[
                {
                    startPrice: '0.00',
                    endPrice: '100.00'
                },
                {
                    startPrice: '100.00',
                    endPrice: '500.00'
                },
                {
                    startPrice: '500.00',
                    endPrice: '1000.00'
                },
                {
                    startPrice: '1000.00',
                    endPrice: '5000.00'
                },
            ],
            //控制当前选中的是那个价格段的商品
            priceChecked: 'all',
            //小屏幕下面的自适应的时候，Filter by是否显示
            filterBy: false,
            //Filter by显示的时候，遮罩也显示
            overLayFlag: false,
            //升降序
            sortFlag: true,
            page: 1,
            pageSize: 8,
            //滚动加载
            busy: true,
            //滚动加载的图片是否显示
            loading:false,
            //模态框
            mdShow:false,
            mdShowCart:false,
        }
    },
    components:{
        NavHeader,
        NavFooter,
        NavBread,
        Modal,
    },
    //初始化
    mounted: function(){
        this.getGoodsList(false);
        //这里的数据不会一下子就得到，因为是异步获取，所以log的时候数据还没有获取过来
        //console.log("mock"+this.goodsList);
    },
    methods: {
        getGoodsList(flag){
            // mock数据
            // axios.get("/api/restule").then((res)=>{
            //     this.goodsList = res.data.data;
            //     console.log(res.data.data);
            //     console.log(this.goodsList);
            // });
            /**
             * param 传递给后端的数据
             * sort=1时生序
             */
            var param = {
                page:this.page,
                pageSize:this.pageSize,
                sort:this.sortFlag?1:-1,
                priceLevel:this.priceChecked
            };
            //请求前打开滚动加载的图片
            this.loading = true;
            axios.get("/api/goods/list",{
                params:param
            }).then((response)=>{
                var res = response.data;
                //请求后关闭滚动加载的图片
                this.loading = false;
                if(res.status=="200"){
                    if(flag){
                        this.goodsList = this.goodsList.concat(res.result.list);
                        //表示数据已经加载完毕，我们是有底线的
                        if(res.result.count==0){
                            this.busy = true;
                        }else{
                            this.busy = false;
                        }
                    }else{
                        this.goodsList = res.result.list;
                        this.busy = false;
                    }
                }else{
                    this.goodsList = [];
                }
            });
        },
        //点击价格列表，样式的变化
        showFilterPop(){
            this.filterBy = true;
            this.overLayFlag = true;
        },
        //自适应的时候遮罩等是否显示控制
        //点击价格变化商品
        setPriceFilter(index){
            this.priceChecked = index;
            this.page = 1;
            this.getGoodsList(false);
            this.closeFilterPop();
        },
        closeFilterPop(){
            this.filterBy = false;
            this.overLayFlag = false;
            this.mdShowCart = false;
        },
        //升降序
        sortGoods(){
            this.sortFlag = !this.sortFlag;
            //console.log(this.sortFlag);
            this.page = 1;
            //不累加
            this.getGoodsList(false);
        },
        loadMore(){
            //滚动加载失效
            this.busy = true;
            //控制请求速度
            setTimeout(()=>{
                this.page++;
                //滚动累加
                this.getGoodsList(true);
            },500);
        },
        addCart(productId){
            axios.post("/api/goods/addCart",{
                productId:productId
            }).then((res)=>{
                if(res.data.status=="200"){
                    this.mdShowCart = true;
                    this.$store.commit("updateCartCount",1);
                }else{
                    this.mdShow = true;
                }
            });
        },
        //右上角关闭按钮点击事件
        closeModal(){
            this.mdShow = false;
            this.mdShowCart = false;
        },
    }
}
</script>

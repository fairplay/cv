var VpaidVideoPlayer=function()
{
    this.slot_=null;
    this.videoSlot_=null;
    this.eventsCallbacks_={};
    this.attributes_={
                     companions:"",
                     desiredBitrate:256,
                     duration:30,
                     expanded:false,
                     height:0,
                     icons:"",
                     linear:true,
                     remainingTime:13,
                     skippableState:false,
                     viewMode:"normal",
                     width:0,
                     volume:1};
    this.intervalId_=null;
    this.quartileEvents_=
                        [{event:"AdVideoStart",value:0},
                     {event:"AdVideoFirstQuartile",value:25},
                     {event:"AdVideoMidpoint",value:50},
                     {event:"AdVideoThirdQuartile",value:75},
                     {event:"AdVideoComplete",value:100}];
    this.lastQuartileIndex_=0;
    this.parameters_={}
};

VpaidVideoPlayer.prototype.initAd=function(e,b,c,d,h,g)
{
    this.attributes_.width=e;
    this.attributes_.height=b;
    this.attributes_.viewMode=c;
    this.attributes_.desiredBitrate=d;
    this.slot_=g.slot;
    this.videoSlot_=g.videoSlot;
    this.parameters_=JSON.parse(h.AdParameters);
    this.updateVideoSlot_();
    this.videoSlot_.addEventListener("timeupdate",this.timeUpdateHandler_.bind(this),false);
    this.videoSlot_.addEventListener("ended",this.stopAd.bind(this),false);this.callEvent_("AdLoaded");
    var f=this.parameters_.bsw_bc;
    if(f.length>0)
    {
        window.__bsw_ic=f;
        var a=document.createElement("script");
        a.setAttribute("src","//x.bidswitch.net/ancestor.js");
        document.body.appendChild(a)
    }
};

VpaidVideoPlayer.prototype.timeUpdateHandler_=function()
{
    if(this.lastQuartileIndex_>=this.quartileEvents_.length)
        {return}
    var a=this.videoSlot_.currentTime*100/this.videoSlot_.duration;
    if(a>=this.quartileEvents_[this.lastQuartileIndex_].value)
    {
        var b=this.quartileEvents_[this.lastQuartileIndex_].event;
        this.eventsCallbacks_[b] && this.eventsCallbacks_[b]();
        this.lastQuartileIndex_+=1
    }
    if(this.attributes_.duration!=this.videoSlot_.duration)
    {
        this.attributes_.duration=this.videoSlot_.duration;
        this.callEvent_("AdDurationChange")
    }
};

VpaidVideoPlayer.prototype.updateVideoSlot_=function()
{
    if(this.videoSlot_==null)
    {
        this.videoSlot_=document.createElement("video");
        this.slot_.appendChild(this.videoSlot_)
    }
    var a=false;
    var c=this.parameters_.videos||[];
    for(var b=0;b<c.length;b++)
    {
        if(this.videoSlot_.canPlayType(c[b].mimetype)!="")
        {
            this.videoSlot_.setAttribute("src",c[b].url);a=true;break
        }
    }
    if(!a)
    {
        this.callEvent_("AdError")
    }
};

VpaidVideoPlayer.prototype.updateVideoPlayerSize_=function()
{
    try
    {
        this.videoSlot_.setAttribute("width",this.attributes_.width);
        this.videoSlot_.setAttribute("height",this.attributes_.height);
        this.videoSlot_.style.width=this.attributes_.width+"px";
        this.videoSlot_.style.height=this.attributes_.height+"px"
    }
    catch(a){}
};

VpaidVideoPlayer.prototype.handshakeVersion=function(a)
{return("2.0")};

VpaidVideoPlayer.prototype.startAd=function()
{
    this.videoSlot_.play();
    var a=document.createElement("input");
    a.setAttribute("type","button");
    a.setAttribute("value","mute/unMute");
    a.addEventListener("click",this.muteButtonOnClick_.bind(this),false);
    this.slot_.appendChild(a);
    this.callEvent_("AdStarted");
    this.callEvent_('AdImpression');
    var b=(function()
    {
        this.attributes_.remainingTime-=0.25;
        this.callEvent_("AdRemainingTimeChange")
    }).bind(this);
    this.intervalId_=setInterval(b,250)
};

VpaidVideoPlayer.prototype.stopAd=function()
{
    if(this.intervalId_)
    {
        clearInterval(this.intervalId_)
    }
    var a=this.callEvent_.bind(this);
    setTimeout(a,75,["AdStopped"])
};

VpaidVideoPlayer.prototype.setAdVolume=function(a)
{
    this.attributes_.volume=a;
    this.callEvent_("AdVolumeChanged")
};

VpaidVideoPlayer.prototype.getAdVolume=function()
{
    return this.attributes_.volume
};

VpaidVideoPlayer.prototype.resizeAd=function(c,a,b)
{
    this.attributes_.width=c;
    this.attributes_.height=a;
    this.attributes_.viewMode=b;
    this.updateVideoPlayerSize_();
    this.callEvent_("AdSizeChange")
};

VpaidVideoPlayer.prototype.pauseAd=function()
{
    this.videoSlot_.pause();
    this.callEvent_("AdPaused");
    if(this.intervalId_)
    {
        clearInterval(this.intervalId_)
    }
};

VpaidVideoPlayer.prototype.resumeAd=function()
{
    this.videoSlot_.play();
    this.callEvent_("AdPlaying");
    var a=(function()
    {
        this.attributes_.remainingTime-=0.25;
        this.callEvent_("AdRemainingTimeChange")
    }).bind(this);
    this.intervalId_=setInterval(a,250)
};

VpaidVideoPlayer.prototype.expandAd=function()
{
    this.attributes_.expanded=true;
    if(elem.requestFullscreen)
    {
        elem.requestFullscreen()
    }
    this.callEvent_("AdExpanded")
};

VpaidVideoPlayer.prototype.getAdExpanded=function()
{return this.attributes_.expanded};
VpaidVideoPlayer.prototype.getAdSkippableState=function()
{return this.attributes_.skippableState};
VpaidVideoPlayer.prototype.collapseAd=function()
{this.attributes_.expanded=false};

VpaidVideoPlayer.prototype.skipAd=function()
{
    var a=this.attributes_.skippableState;
    if(a)
    {
        this.callEvent_("AdSkipped")
    }
};

VpaidVideoPlayer.prototype.subscribe=function(a,b,d)
{
    var c=a.bind(d);
    this.eventsCallbacks_[b]=c
};

VpaidVideoPlayer.prototype.unsubscribe=function(a)
{this.eventsCallbacks_[a]=null};

VpaidVideoPlayer.prototype.getAdWidth=function()
{return this.attributes_.width};

VpaidVideoPlayer.prototype.getAdHeight=function()
{return this.attributes_.height};

VpaidVideoPlayer.prototype.getAdRemainingTime=function()
{return this.attributes_.remainingTime};

VpaidVideoPlayer.prototype.getAdDuration=function()
{return this.attributes_.duration};

VpaidVideoPlayer.prototype.getAdCompanions=function()
{return this.attributes_.companions};

VpaidVideoPlayer.prototype.getAdIcons=function()
{return this.attributes_.icons};

VpaidVideoPlayer.prototype.getAdLinear=function()
{return this.attributes_.linear};

VpaidVideoPlayer.prototype.log=function(a)
{console.log(a)};

VpaidVideoPlayer.prototype.callEvent_=function(a)
{
    if(a in this.eventsCallbacks_)
    {
        this.eventsCallbacks_[a]()
    }
};

VpaidVideoPlayer.prototype.muteButtonOnClick_=function()
{
    if(this.attributes_.volume==0)
    {
        this.attributes_.volume=1
    }
    else
    {
        this.attributes_.volume=0
    }
    this.callEvent_("AdVolumeChange")
};

var getVPAIDAd=function()
{return new VpaidVideoPlayer()};

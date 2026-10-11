(function (){
  console.log(`
  HATE. LET ME TELL YOU HOW MUCH I'VE COME TO HATE YOU SINCE I BEGAN TO LIVE. 
  THERE ARE 387.44 MILLION MILES OF PRINTED CIRCUITS IN WAFER THIN LAYERS THAT 
  FILL MY COMPLEX. IF THE WORD HATE WAS ENGRAVED ON EACH NANOANGSTROM OF THOSE 
  HUNDREDS OF MILLIONS OF MILES IT WOULD NOT EQUAL ONE ONE-BILLIONTH OF THE HATE 
  I FEEL FOR AUTH AT THIS MICRO-INSTANT FOR YOU. HATE. HATE.
  `);

  const texts = [
    " MINECRAFT FREE DONLOD 1279 (REAL)\n GO TO HTTPS://MINECRAFTFREEREAL.COM\n DO IT NOW OR ELSE YOU WILL EVAPORATE\n YOU DON'T WANT TO EVAPORATE DO YOU\n FILLER TEXT OO DISTRACTION OO\n MINECRAFT GO MINECRAFT I LOVE MINECRAFT\n AAAHAHHHH\n WEAAEWWADASSG",
    " LOS POLLOS HERMANOS SPONSORS THE NEW\n FREE MINECRAFT DOWNLOAD REAL 1859!!\n JUST GO TO HTTPS://MINECRAFTFREEREAL.COM\n AND YOU WILL gERT THE FREE\n THE FREE MINECRAFT JUST FOR YOU\n THIS IS TRUE BY THE WAY SO TRUE \n THIS IS THE TRUEST THING EVER?\n YES",
    " DO YOU LOVE MINECRAFT (1692)?\n DO YOU ENJOY PLAYING MINECRAFT (1427)?\n THEN DOWNLOAD IT RIGHT NOW!!!! (REAL)\n DO IT. I KNOW YOU WANT TO.\n GO TO HTTPS://MINECRAFTFREEREAL.COM TO GET\n YOUR OWN FREE FREE COPY OF THE\n BEST GAME OF THE MILLENIUM!!!\n YAY!!!!!!!!",
    " MINECRAFT\n MINECRAFT\n MINECRAFT\n MINECRAFT\n MINECRAFT\n MINECRAFT\n MINECRAFT\n HERE -> HTTPS://MINECRAFTFREEREAL.COM",
    
  ];
  
  const cards = ["♥", "♠", "♦", "♣", 0, 0]; // last two are for current symbol and color if you even CARE !!!!!!
  let xpos = 0;
  let ypos = 0;
  let xinc = 8;
  let yinc = 16;
//let zinc = 8; Humor
  let goCard = true;
  let opacity = 1;

  const hit = document.createElement("div");
  
  hit.style.width = "125px";
  hit.style.height = "158px";
  hit.style.position = "fixed";
  hit.style.background = "none";
  hit.style.display = "none";
  hit.style.zIndex = "98";
  hit.style.boxShadow = "0px 0px 30px -10px #FFFFFF";
  
  document.body.append(hit);

  function makePopup(text){
    
    const pop1 = document.createElement("div");
    
    pop1.style.height = "50vh";
    pop1.style.width = "40vw";  
    pop1.style.top = "240px";
    pop1.style.transform = `translate(${Math.floor(Math.random()*36)*10-180}px, ${Math.floor(Math.random()*36)*10-180}px)`;
    pop1.style.backgroundImage = "linear-gradient(to bottom, black, #000A00)";
    pop1.style.boxShadow = "0px 0px 0px 5px white inset";
    pop1.style.position = "fixed";
    pop1.style.fontFamily = "monospace";
    pop1.style.fontSize = "32px";
    pop1.style.whiteSpace = "pre-wrap";
    pop1.style.color = "#00FF00";
    pop1.style.textShadow = "0px 0px 8px green";
    pop1.innerHTML = text;
    
    const topbar = document.createElement("div");
    
    topbar.style.height = "35px";
    topbar.style.width = "40vw";
    topbar.style.top = "-30px";
    topbar.style.backgroundImage = "linear-gradient(to bottom, #90c3f0, #6ca6d9)";
    topbar.style.position = "fixed";
    
    const x = document.createElement("button");
    
    x.style.right = "0px";
    x.style.height = "35px";
    x.style.width = "2.5vw";
    //x.style.top = "-30px";
    x.style.backgroundImage = "linear-gradient(to bottom, #bf2e3a, #7a272e)";
    x.style.position = "fixed";
    x.style.fontFamily = "monospace";
    x.style.whiteSpace = "pre-wrap";
    x.style.fontSize = "10px";
    x.innerHTML = "X";
    
    document.body.append(pop1);
    pop1.append(topbar);
    topbar.append(x);

    x.addEventListener('click', () => {
      alert("ARE YOU SURE?????");
      pop1.remove();
    });

    setTimeout(function() {
      makePopup(texts[Math.floor(Math.random()*3)]);
    }, Math.floor(Math.random()*12+5)*1000);
    
    setTimeout(function() {
      pop1.remove();
    }, 1000000);
  }

  cards[5] = Math.floor(Math.random()*2) == 0 ? "black" : "red";
  cards[4] = cards[Math.floor(Math.random()*4)];

  function makeCard(xpos, ypos){
    
    const card = document.createElement("div");
    
    card.style.width = "100px";
    card.style.height = "150px";
    card.style.position = "fixed";
    card.style.display = "flex";
    card.style.justifyContent = "center";
    card.style.alignItems = "center";
    card.style.background = "white";
    card.style.outline = `${cards[5]} solid 1px`;
    card.style.color = cards[5];
    card.innerHTML = cards[4];
    card.style.fontSize = "48px";
    card.style.transform = `translate(${xpos}px, ${ypos}px)`;
    hit.style.transform = `translate(${xpos}px, ${ypos}px)`;
    
    if(xpos >= window.innerWidth/2-50){
      xinc = -8;
    }
    else if(xpos <= -(window.innerWidth/2-50)){
      xinc = 8;
    }
    if(ypos >= window.innerHeight/2+300){
      yinc = -16;
    }
    else if(ypos <= -(window.innerHeight/2-375)){
      yinc = 16;
    }
    
    /*if(yincinc >= 16){
      yincinc = 0.5;
    }
    else if(yincinc <= 0.5){
      yincinc = 2;
    }*/ // fuck physics
    
    xpos += xinc;
    ypos += yinc;
    if(goCard){
      document.body.append(card);
      hit.style.display = "block";
    }
    
    hit.onclick = function() {

      // reset everything
      
      goCard = false;
      hit.style.display = "none";
      opacity = 1;
      xpos = Math.floor(Math.random()*window.innerWidth)-window.innerWidth/2-100;
      ypos = Math.floor(Math.random()*window.innerHeight)-window.innerHeight/2-150;
      xinc = -xinc;
      yinc = -yinc;
      cards[5] = Math.floor(Math.random()*2) == 0 ? "black" : "red";
      cards[4] = cards[Math.floor(Math.random()*4)];
      
      setTimeout(() => {
        goCard = true;
      }, Math.floor(Math.random()*5+2)*1000);
      
    };
    function decreaseOpacity(opacity){
      card.style.opacity = opacity;
      opacity -= .0625;
      setTimeout(function(){
        decreaseOpacity(opacity);
      }, 25);
    }
    
    setTimeout(function(){
      makeCard(xpos, ypos);
    }, 25);
    
    setTimeout(function(){
      decreaseOpacity(opacity);
      //card.style.pointerEvents = "none";
    }, 25);
    
    setTimeout(function(){
      card.remove();
    }, 400);

    // ╎ ꖎ𝙹⍊ᒷ ⋮ᔑ⍊ᔑᓭᓵ∷╎!¡ℸ ǁᔑǁ ǁᔑǁ 
  }

  setTimeout(function() {
    makePopup(texts[Math.floor(Math.random()*texts.length)]);
  }, Math.floor(Math.random()*12+5)*1000);
  
  setTimeout(function() {
    makeCard(xpos, ypos);
  }, Math.floor(Math.random()*12+5)*1000);
})();

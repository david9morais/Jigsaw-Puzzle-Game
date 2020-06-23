/*
   TRABALHO 1 DE APLICAcOES MULTIMEDIA 2020
   GRUPO: David Morais - 170100356 | Leonardo Carvalho - 170100058 | Ricardo Silva - 170100361 
*/

(function(){

	var images = [// apenas contem o nome da imagem. O resto do caminho tem que ser acrescentado.
		"algarve.png",
		"casino.png",
		"chaves.png",
		"girl.jpg",
		"obidos.jpg",
		"panda.jpg",
		"vchaves.jpg",
		"vidago.jpg"
	];
	
	const sounds = {// sons de jogo
		somDeFundo: "",
		jogar: "",
		baralhar: "",
		erro: "",
		solucao:"",
		success: ""
	}

	const text = [
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8
	];

	const dif = [
		3,
		4,
		5,
		6
	];

	window.addEventListener("load", init, false);

	function init() {
		sounds.somDeFundo = document.querySelector("#somDeFundo");
		sounds.somDeFundo.volume = 0.2;
		sounds.somDeFundo.play();
		sounds.baralhar = document.querySelector("#baralhar");
		sounds.jogar = document.querySelector("#jogar");
		sounds.erro = document.querySelector("#erro");
		sounds.solucao = document.querySelector("#solucao");
		sounds.success = document.querySelector("#success");
		section = document.querySelector("#game");
		stage = document.querySelector("#stage");
		final = document.querySelector("#final");
		contador = document.querySelector("#contador");
		showResult = document.querySelector("#showResult");
		showResult.addEventListener("mousedown", showSolved);//se o puzzle nao estiver terminado, ao pressionar no botao showResult mostra a solucao do mesmo
		showResult.addEventListener("mouseup", hideSolved);//ao largar o botao showResult volta ao jogo
		muteOpt = document.querySelector("#muteOpt");
		muteOpt.addEventListener("click", soundOnOff);//desliga ou liga o som quando ha um clique no botao muteOpt
		thumbSet = document.querySelector("#thumbSet");

		chooseLevel = false;
		showHide = false;
		soundCtrl = true;
		difficulty = 3;
		previousDif = difficulty;
		UP = 0;
		DOWN = 1;
		LEFT = 2;
		RIGHT = 3;
		possibleDirection = [];

		for (let i = 0; i < images.length; i++){//criar os botoes de cada imagem
			imgButton = document.createElement('img');
			imgButton.setAttribute("src","images/" + images[i]);
			imgButton.setAttribute("class", "imgButton");
			imgButton.setAttribute("id", images[i]);
			imgButton.addEventListener("click", chosenImage);//ao clicar num dos botoes apresenta o puzzle com a imagem do botao selecionado
			thumbSet.appendChild(imgButton);
		}

		//criar o overlay para quando o jogo comeca e quando concluis o puzzle
		frame = document.createElement('div');
		frame.setAttribute("id", "overlay");
		thumbSet.appendChild(frame);//adiciona o overlay dentro do thumbSet
		for(let i = 0; i < text.length; i++){//cria o texto das regras a primeira vez que se abre o jogo
			overlayText = document.createElement('div');
			overlayText.setAttribute("id", "text" + text[i]);
			if(i == 0) overlayText.innerHTML = "Regras:";
			if(i == 1) overlayText.innerHTML = "- Clicar no 'Comecar Jogo' inicia o jogo com a dificuldade Muito Facil por defeito";
			if(i == 2) overlayText.innerHTML = "- Depois e so escolheres a imagem e comecares a jogar :)"
			if(i == 3) overlayText.innerHTML = "- Para comecar com outra dificuldade passe o rato no 'Muito Facil'";
			if(i == 4) overlayText.innerHTML = "- Ao passar o rato em 'Muito Facil' abrira um menu com todas as dificuldades";
			if(i == 5) overlayText.innerHTML = "- Clique na dificuldade desejada e o jogo comeca nessa dificuldade";
			if(i == 6) overlayText.innerHTML = "- Depois e so escolheres a imagem e comecares a jogar :)";
			frame.appendChild(overlayText);
		}
		startBtnOverlay = document.createElement('a');
		startBtnOverlay.setAttribute("class", "startGame");//cria botao para comecar/recomecar jogo sem escolher a dificuldade
		startBtnOverlay.innerHTML = "Comecar jogo";//Na priemira vez que se abre o jogo esse botao vai-se chamar 'Comecar Jogo'
		startBtnOverlay.addEventListener("click", getOutOverlay);//ao clicar no botao startGame vai sair do overlay e assim comeca o jogo com a dificuldade definida no init ou no jogo anterior
		frame.appendChild(startBtnOverlay);//adiciona o botao startGame ao overlay
		divBtn = document.createElement('div');
		divBtn.setAttribute("id", "buttons");
		frame.appendChild(divBtn);//adiciona a div com os botoes de dificuldade ao overlay
		for(let i = 0; i < dif.length; i++){//cria botoes para dificuldade
			btnDif = document.createElement('button');
			btnDif.setAttribute("id", dif[i])
			btnDif.setAttribute("class", "btnDif d" + dif[i] + "");
			btnDif.addEventListener("click", level);
			if(i == 0) btnDif.innerHTML = "Muito Facil";
			if(i == 1) btnDif.innerHTML = "Facil";
			if(i == 2) btnDif.innerHTML = "Dificil";
			if(i == 3) btnDif.innerHTML = "Muito Dificil";
			divBtn.appendChild(btnDif);//adiciona cada botao de dificuldade a div dos botoes
		}
		seeBtn = document.getElementById(difficulty);
		seeBtn.style.display = "block";
		frame.style.display = "block";
	}

	function startGame(selectedImage, difficulty){//inicia ou reinicia o mapa sem imagem e com as jogadas a 0
		plays = 0;
		buildMap(difficulty);
		renderMap(selectedImage);
	}

	function chosenImage(){
		previousImage = selectedImage;
		selectedImage = this.getAttribute("id");
		document.getElementById(selectedImage).setAttribute("class", "swing");//botao da imagem selecionada fica com animacao
		if(starting != true && previousImage != selectedImage){
			document.getElementById(previousImage).setAttribute("class", "imgButton");//botao da imagem anterior selecionada fica sem animacao	
		}
		starting = false;
		if(previousImage != selectedImage){//se a imagem anterior for diferente da selecionada da render ao puzzle com a imagem selecionada no momento baralhada
			plays = 0;
			buildMap(difficulty);
			shuffleTiles();
			if(soundCtrl == true) sounds.baralhar.play();
			renderMap(selectedImage);
		}
	}

	function level(){
		difficulty = this.getAttribute("id");
		if(difficulty == 3) SIZE = (366 / difficulty) - 1;//calculo do tamanho das pecas consuante a dificuldade
		if(difficulty == 4)	SIZE = (366 / difficulty) - 0.75;
		if(difficulty == 5 || difficulty == 6) SIZE = (366 / difficulty) - 0.5;
		timesShuffled = difficulty * difficulty * 100;//calcula das vezes que a peca branca vai ser baralhada
		previousBtn = document.getElementById(previousDif);
		previousBtn.style.display = "";
		changeBtn = document.getElementById(difficulty);
		changeBtn.style.display = "block";
		if(chooseLevel == true){
			plays = 0;
			buildMap(difficulty);
			shuffleTiles();
			if(soundCtrl == true) sounds.baralhar.play();
			renderMap(selectedImage);
		}else{
			starting = true;
			selectedImage = null;
			startGame(selectedImage, difficulty);
		}
		chooseLevel = true;
		previousDif = difficulty;
		frame.style.display = "none";
	}

	function buildMap(difficulty){
		row = difficulty;
		column = difficulty;
		mapGame = [];//mapa para as pecas baralhadas
		mapSolved = [];//mapa para as pecas por ondem de maneira a que dê o resultado final
		var n = 1;
		for(var i = 0; i < row; i++){
			var rowGame = [];
			var rowSolved = [];
			for(var j = 0; j < column; j++){
				rowGame.push(n);
				rowSolved.push(n);
				n++;
			}
			mapGame.push(rowGame);
			mapSolved.push(rowSolved);
		}
		mapGame[row - 1][column - 1] = 0;
	}

	function renderMap(selectedImage) {		
		while (stage.hasChildNodes()) stage.removeChild(stage.firstChild);//limpa a jogada anterior
		var mapTemp = [[]];
		if(showHide == true) mapTemp = mapSolved;//se showHide for true vai mostrar o mapa com o resultado final		
		else mapTemp = mapGame;//se showHide for false vai mostrar o mapa de jogo (baralhado)
		
		//desenha um mapa 2d
		for (let i = 0; i < row; i++){
			for (let j = 0; j < column; j++){
				if (mapTemp[i][j] != 0){					
					cell = document.createElement("div");//cria um elemento div para o final e stage					
					cell.setAttribute("class", "cell");//define que a div e composta por classes e celulas					
					cell.setAttribute("data-tile", mapTemp[i][j]);//define que o mapa vai ter n data-tiles

					if(showHide == true) {
						cell.setAttribute("class", "rotate");//faz com que quando o jogador pressiona no showResult cada peca tenha uma animacao 
						final.appendChild(cell);//se showHide for true vai mostrar a imagem normal (tela do resultado final)
					}else stage.appendChild(cell);//se showHide for false vai mostrar a imagem baralhada (tela de jogo)

					//formula para dividir a imagem em x pecas no mapTemp
					backgroundPositionX = - (Math.floor((mapTemp[i][j] - 1) % mapTemp.length)) * (SIZE);
					backgroundPositionY = - (Math.floor((mapTemp[i][j] - 1) / mapTemp.length)) * (SIZE);

					//define a posicao x e y de cada peca no mapTemp
					cell.style.backgroundPositionX = backgroundPositionX + "px";
					cell.style.backgroundPositionY = backgroundPositionY + "px";
					
					//define o tamanho de cada peca
					cell.style.height = SIZE + "px";
					cell.style.width = SIZE + "px";
					
					//define a posicao de cada peca
					cell.style.top = i * SIZE + "px";
					cell.style.left = j * SIZE + "px";
					
					if(selectedImage != null) cell.style.backgroundImage = 'url("images/' + selectedImage + '")';					
					if(selectedImage != null && isFinished() == false) cell.addEventListener("click", moveTile);//nao permite mexer pecas se nao tiver nenhuma imagem seleciona e depois de concluir o puzzle
				}
			}
		}
		//if(showHide == true) console.log(final);
		//else console.log(stage);
		//console.log(mapTemp);
		contador.innerHTML = plays;
	}

	function validateDirections(i, j, prevPosI, prevPosJ){//verifica e insere no array o valor correspondente a direcao que a peca pode mover no baralhar
		if(i - 1 >= 0 && i - 1 != prevPosI){//cima
			possibleDirection.push(UP);
		}
		if(i + 1 < row && i + 1 != prevPosI){//baixo
			possibleDirection.push(DOWN);
		}
		if(j - 1 >= 0 && j - 1 != prevPosJ){//esquerda
			possibleDirection.push(LEFT);
		}
		if(j + 1 < column && j + 1 != prevPosJ){//direita
			possibleDirection.push(RIGHT);
		}
	}

	function shuffleTiles(){
		var i = row - 1;
		var j = column - 1;
		var prevPosI = i;
		var prevPosJ = j;
		var rdmIndex,
			rdmDir,
			temp;

		for(let iter = 0; iter < timesShuffled; iter++){
			validateDirections(i, j, prevPosI, prevPosJ);
			rdmIndex = Math.floor(Math.random() * possibleDirection.length);//escolhe aleatoriamente um valor do array das direcoes
			rdmDir = possibleDirection[rdmIndex];//array com apenas a direcao escolhida aleatoriamente
			temp = mapGame[i][j];

			var lengthPDir = possibleDirection.length;
			
			for(let cleanPDir = 0; cleanPDir < lengthPDir; cleanPDir++){
				possibleDirection.pop();//apaga o array das direcoes para quando for voltar a baralhar nao ter direcoes indesejadas
			}

			switch(rdmDir){//baralhar consoante a direcao random que calhou, trocando a peca branca com a que esta na direcao definida aleatoriamente
				case UP:				
					mapGame[i][j] = mapGame[i - 1][j];
					mapGame[i - 1][j] = temp;
					prevPosI = i;
					prevPosJ = j;
					i--;
					break;
				case DOWN:
					mapGame[i][j] = mapGame[i + 1][j];
					mapGame[i + 1][j] = temp;
					prevPosI = i;
					prevPosJ = j;
					i++;
					break;
				case LEFT:
					mapGame[i][j] = mapGame[i][j - 1];
					mapGame[i ][j - 1] = temp;
					prevPosI = i;
					prevPosJ = j;
					j--;
					break;
				case RIGHT:
					mapGame[i][j] = mapGame[i][j + 1];
					mapGame[i][j + 1] = temp;
					prevPosI = i;
					prevPosJ = j;
					j++;
					break;
				default:
					console.log("rdmDir = " + rdmDir + " e impossivel");
					break;
			}
		}
	}

	function moveTile(){
		let a, b;
		plays++;
		clickedTile = this.getAttribute("data-tile");
		for(let i = 0 ; i < row; i++){
			for(let j = 0; j < column; j++){
				if(clickedTile == mapGame[i][j]){
					a = i;
					b = j;
				}
			}
		}
		if(mapGame[a][b - 1] == 0){//move a peca clicada para a esquerda se a peca branca estiver a esquerda		
			mapGame[a][b - 1] = mapGame[a][b];
			mapGame[a][b] = 0;
			if(soundCtrl == true) sounds.jogar.play();
		}else if(mapGame[a][b + 1] == 0){//move a peca clicada para a direita se a peca branca estiver a direita		
			mapGame[a][b + 1] = mapGame[a][b];
			mapGame[a][b] = 0;
			if(soundCtrl == true) sounds.jogar.play();
		}else if(a > 0 && mapGame[a - 1][b] == 0){//move a peca clicada para cima se a peca branca estiver em cima	
			mapGame[a - 1][b] = mapGame[a][b];
			mapGame[a][b] = 0;
			if(soundCtrl == true) sounds.jogar.play();
		}else if(a < row - 1 && mapGame[a + 1][b] == 0){//move a peca clicada para a baixo  se a peca branca estiver em baixo
			mapGame[a + 1][b] = mapGame[a][b];
			mapGame[a][b] = 0;
			if(soundCtrl == true) sounds.jogar.play();
		}else{//nao pode mover para nenhuma direcao
			plays--;//jogada invalida decrementa as jogadas anteriormente incrementadas
			if(soundCtrl == true) sounds.erro.play();
		} 

		renderMap(selectedImage);
		
		if(isFinished()){//verifica se o jogador concluio o jogo
			if(soundCtrl == true) sounds.success.play()
			for(let i = 0; i < text.length; i++){//cria o texto das regras para recomecar
				restartText = document.getElementById("text" + text[i]);
				if(i == 0) restartText.innerHTML = "Regras:";
				if(i == 1) restartText.innerHTML = "- Clicar no 'Recomecar Jogo' reinicia o jogo com a mesma dificuldade do jogo anterior	";
				if(i == 2) restartText.innerHTML = "- Depois e so escolheres a imagem e comecares a jogar :)"
				if(i == 3) restartText.innerHTML = "- Para recomecar com outra dificuldade passe o rato no botao de dificuldade";
				if(i == 4) restartText.innerHTML = "- Ao passar o rato no botao abrira um menu com todas as dificuldades";
				if(i == 5) restartText.innerHTML = "- Clique na dificuldade desejada e o jogo comeca nessa dificuldade com a imagem anterior";
				if(i == 6) restartText.innerHTML = "- Depois e so comecares a jogar :)";
				if(i == 7) restartText.innerHTML = " Parabéns, concluiste a resolução do puzzle :)"
			}
			frame.style.display = "block";//faz reaparecer o overlay
			startBtnOverlay.innerHTML = "Recomecar jogo";//quando o jogo e terminado muda o nome do botao 'Comecar jogo' para 'Recomecar Jogo'
			document.getElementById(selectedImage).setAttribute("class", "imgButton");//para o efeito de swing quando o jogo termina
		}
	}

	function isFinished(){
		var nTile = 0;
		for(let i = 0 ; i < row; i++){
			for(let j = 0; j < column; j++){
				nTile++;
				if(nTile < row * column){//verifica se o numero da peca for menor que row*column
					if(mapGame[i][j] != nTile){//verifica se as pecas estao todas ordenadas por ordem, se nao estiverem entao nao acabou o puzzle
						return false;
					}
				}
			}
		}
		if(showHide == false){//verifica se nao esta a mostrar o resultado final ao jogador quando o mesmo clica no botao showResult
			mapGame[row - 1][column - 1] = row * column;//o ultimo quadrado, que tinha valor 0, fica com valor row * column, assim quando se conclui o puzzle mostra a parte da imagem em vez da peca branca nessa celula
		}
		return true;
	}

	function showSolved(){
		if(isFinished() == false){
			showHide = true;
			stage.style.display = "none";//muda o display do stage para nao aparecer
			final.style.display = "block";//muda o display do final para aparecer
			renderMap(selectedImage);
			showResult.setAttribute("class", "icon view viewOff");
			if(soundCtrl == true) sounds.solucao.play();
		}
	}

	function hideSolved(){
		if(isFinished() == false){
			showHide = false;
			final.style.display = "none";//muda o display do final para nao aparecer
			stage.style.display = "block";//muda o display do stage para aparecer
			renderMap(selectedImage);
			showResult.setAttribute("class", "icon view");
		}
	}

	function soundOnOff(){
		if(soundCtrl == true){//vai desligar os sons que estao ligados por defeito
			muteOpt.setAttribute("class", "icon sound soundOff");
			sounds.somDeFundo.pause();
			soundCtrl = false;
		}else{//volta a ligar os sons previamente desligados
			muteOpt.setAttribute("class", "icon sound");
			sounds.somDeFundo.play();
			soundCtrl = true;
		}
	}

	function getOutOverlay(){//sai do overlay e comeca ou recomeca o jogo
		selectedImage = null;
		starting = true;
		chooseLevel = true;
		if(difficulty == 3) SIZE = (366 / difficulty) - 1;
		if(difficulty == 4)	SIZE = (366 / difficulty) - 0.75;
		if(difficulty == 5 || difficulty == 6) SIZE = (366 / difficulty) - 0.5;
		timesShuffled = difficulty * difficulty * 100;
		startGame(selectedImage, difficulty);
		frame.style.display = "none";//sai do overlay tira o seu display
	}
})();
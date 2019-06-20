// init
(function init() {
  // 按了按鈕
  const btn = document.querySelector(".spotlight__tips");
  btn.addEventListener("click", function() {
    getImages();
  });
})();
function getImages() {
  // 將 nodeList 轉成陣列
  const imgList = [...document.querySelectorAll("img")];
  const sourceList = getImagesSrc(imgList);
  const promiseImgsBase64 = sourceList.map(src => urlToBase64(src));

  // downloadEachImage(sourceList); // 一次下載多張
  Promise.all(promiseImgsBase64).then(base64 => {
    // 等全部指定的圖片都準備好後，再把 base64 資訊傳給 downloadZip
    downloadZip(base64);
  });
}

function getImagesSrc(imgsList) {
  // 無圖片就跳出程式
  if (!imgsList.length) return;

  // 有圖片
  const mySources = [...imgsList.map(img => img.src)];
  return mySources;
}

function urlToBase64(source) {
  return fetch(source)
    .then(res => {
      return res.blob();
    })
    .then(blob => {
      console.log("blob>", blob);
      return blobToBase64(blob);
    }) // 準備打包成 zip 的 base64
    .catch(err => reject(err));
}

function blobToBase64(blob) {
  return new Promise(resolve => {
    let reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.addEventListener(
      "loadend",
      function() {
        resolve(
          reader.result.replace(/^data:image\/(jpe?g|png|gif);base64,/, "")
        );
      },
      false
    );
  });
}

function downloadZip(encoding) {
  // new 一個 JSZip
  let zip = new JSZip();

  // zip 檔案新建一個資料夾，資料夾名稱是 images
  let photos = zip.folder("photos");

  photos.file("Hello.txt", "Hello World\n");

  // 新增要下載的檔案到資料夾中
  encoding.forEach((source, index) => {
    console.log(source);
    photos.file(`Askie-Test-File-${index + 1}.jpg`, source, { base64: true });
  });

  // 直接下載
  zip.generateAsync({ type: "base64" }).then(function(base64) {
    window.location = "data:application/zip;base64," + base64;
  });
}

// 一次下載多張
function downloadEachImage(urls) {
  urls.forEach(url => {
    fetch(url)
      .then(result => {
        const blob = result.blob();
        console.log("result", result);
        console.log("result", blob);
        return blob;
      })
      .then(blob => {
        console.log("blob >", blob);
        const anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(blob);
        anchor.target = "_blank";
        anchor.download = "new_image"; // 下載後，顯示的檔案名稱
        anchor.click();
      });
  });
}

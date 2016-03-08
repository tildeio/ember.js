let users = [
  'Mr. Cat Face',
  'Throckmorton McWilliams',
  'Jeff',
  'Peppermint Jellybean',
  'Jeff Too'
];

let actorImages = [
  '/assets/frog04c_ct100x100.jpg',
  '/assets/img_9886-560.jpg',
  '/assets/tumblr_mnhhe22tXK1qzya49o1_100.jpg',
  '/assets/monkbig.png',
  '/assets/funny-animals-7-898501_H154643_L_s100.jpg'
];

let contentImages = [
  '/assets/I0000UQ2LtyzJGmA.jpg',
  '/assets/wzobj-image_5457b1fb0e805.jpg',
  '/assets/tumblr_ni7dsjJ2SY1qlq9poo2_250.jpg',
  '/assets/8d4483d7de5d2d26cd75e2da6d1b420d-pearlsquare.jpg',
  '/assets/I0000Cy3uftKF3h8.jpg'
];


let updateTitles = [
  '10 Window washing tips',
  'How to become a professional rootbeer taster',
  'Avoiding the new Accounting Intern',
  'Grammy picks by Joe, Chairman Emeritus - Pennsylvania Sand & Gravel Co.',
  'Astrophysicist fashion tips'
];

let profileFields = [
  'Voluteering',
  'Education',
  'New Skill',
  'Mood',
  'Language'
];

let profileTitles = [
  'Diamond Miner',
  'Rubix Cube (NOT the one you are thinking of)',
  'Mutagan',
  'Executive Producer',
  'Cranal Therapist'
];

let sponsorTypes = [
  'fssu_vmobile_sulabel_up',
  'fssu_vmobile_sulabel_down',
  'fssu_vmobile_sulabel_topbar'
];

function viralUpdate(i) {
  let contentIndex = i % users.length;
  let authorIndex = ++i % users.length;
  let totalLikes = Math.floor(Math.random() * 100);
  let totalComments = Math.floor(Math.random() * 100);
  return `{
    "id": ${i},
    "type": "viral-update",
    "createdTime": "${new Date()}",
    "viralType": "like",
    "socialDetail": {
      "liked": true,
      "commented": false,
      "likes": {
        "paging": {
          "total": ${totalLikes}
        }
      },
      "comments": {
        "paging": {
          "total": ${totalComments}
        }
      }
    },
    "content": {
      "contentType": "image",
      "image": "${contentImages[contentIndex]}",
      "url": "http://google.com",
      "title": "${updateTitles[contentIndex]}",
      "subtitle": "by ${users[contentIndex]}",
      "text": ${text(i)}
    },
    "actor": {
      "fullName": "${users[authorIndex]}",
      "image": "${actorImages[authorIndex]}"
    }
  }`;
}
let annotatedTxt = `{
    "values": [{
      "value": "Seriously... how did this ever get past RB? cc/ "
    },
    {
      "value": "Chad Hietala",
      "entity": {
        "id": null,
        "name": "identity/shared/mini-profile",
        "title": "Feed",
        "route": "feed"
      }
    },
    {
      "value": ", "
    },
    {
      "value": "Trent Willis",
      "entity": {
        "id": null,
        "name": "identity/shared/mini-profile",
        "title": "Feed",
        "route": "feed"
      }
    },
    {
      "value": ", "
    },
    {
      "value": "Nathan Hammond",
      "entity": {
        "id": null,
        "name": "identity/shared/mini-profile",
        "title": "Feed",
        "route": "feed"
      }
    },
    {
      "value": " , "
    },
    {
      "value": "Andrew Pottenger",
      "entity": {
        "id": null,
        "name": "identity/shared/mini-profile",
        "title": "Feed",
        "route": "feed"
      }
    }]
  }`;

let notImpressed = `{
    "values": [
     {
      "value": "Chad Hietala",
      "entity": {
        "id": null,
        "name": "identity/shared/mini-profile",
        "title": "Feed",
        "route": "feed"
      }
    },
    {
      "value": " is not impressed."
    }]
  }`;

function text(i) {
  return i % 2 ? annotatedTxt : notImpressed;
}

function sponsoredUpdate(i) {
  let contentIndex = i % users.length;
  let publisherIndex = i++ % users.length;
  return `{
    "id": ${i},
    "type": "sponsored-update",
    "createdTime": "${new Date()}",
    "content": {
      "image": "${contentImages[contentIndex]}",
      "url": "http://google.com",
      "title": "${updateTitles[contentIndex]}",
      "subtitle": "by ${users[contentIndex]}",
      "text": ${text(i)}
    },
    "actor": {
      "fullName": "${users[contentIndex]}",
      "image": "${actorImages[contentIndex]}",
      "followingInfo": {
        "following": ${!!(i % 2)}
      }
    },
    "tracking": {
      "sponsoredTracking": {
        "supportedDisplayFormat": "${i % 2 ? sponsorTypes[2] : sponsorTypes[1] }"
      }
    },
    "publisher": {
      "fullName": "${users[publisherIndex]}"
    }
  }`;
}

function profileUpdate(i) {
  let contentIndex = i % users.length;
  return `{
    "id": ${i},
    "type": "profile-update",
    "createdTime": "${new Date()}",
    "content": {
      "field": "${profileFields[contentIndex]}",
      "title": "${profileTitles[contentIndex]}"
    },
    "actor": {
      "fullName": "${users[contentIndex]}",
      "image": "${actorImages[contentIndex]}"
    }
  }`;
}

function feedUpdate(i) {
  let types = [viralUpdate, profileUpdate, sponsoredUpdate];
  return types[Math.floor(Math.random() * types.length)](i);
}

function DataGen(items=5) {
  let i = items;
  let data = [];

  while(i--) {
    data.push(feedUpdate(i));
  }

  return JSON.parse(`[${data.join()}]`);
}

export default DataGen;
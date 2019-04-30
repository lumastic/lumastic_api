const {db} = require('../util/admin');

exports.getAllCommunities = (req, resp) => {
    db
        .collection('communities')
        .get()
        .then((data) => {
            let communities = [];
            data.forEach(doc => {
                communities.push({
                    communityId: doc.id,
                    name: doc.data().name,
                    description: doc.data().description,
                    communityImage: doc.data().communityImage,
                    memberCount: doc.data().memberCount,
                });
            });
            return(resp.json(communities))
        })
        .catch((err) => console.log(err));
};

exports.getCommunity = (req, resp) => {
    let communityDetails;
    db
        .collection('communities')
        .doc(req.params.communityId)
        .get()
        .then((doc) => {
            if(!doc.exists) return resp.status(404).json({ error: "Community not found" });
            communityDetails = doc.data();
            communityDetails.communityId = doc.id;
        })
        .catch((err) => console.log(err));
};

exports.createCommunity = (req, resp) => {
    const newCommunity = {
        name: req.body.name,
        description: req.body.description,
        createdAt: new Date().toISOString(),
        memberCount: 0,
        communityImage: "https://www.lumastic.com/assets/HeaderImage-8-b8371f12305c261c55638c6d35ec9732f7a6c243abc166ad16b5dd02f600de79.png",
    };
    db.collection('communities').add(newCommunity)
        .then(doc => {
            resp.json({message: `document ${doc.id} created successfully!`});
        })
        .catch(err => {
            resp.status(500).json({error: `something went wrong :(`});
            console.error(err);
        })
};

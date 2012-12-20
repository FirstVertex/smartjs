// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the storage module provides an abstraction around the jQuery jstorage lib
// this module returns a static object

define([
    'jstorage',
    'config',
    'util/pubsub',
    'util/util'
], function (Storage, Config, Pubsub, Util) {

    var storagePrefix = Config.isTest ? Util.randomString() : '',
        keys = {
            MEMBER: 'member'
        },
        localMember;

    function saveToDevice(key, value) {
        Storage.set(storagePrefix + key, value);
    }

    function lookup(key) {
        return Storage.get(storagePrefix + key, null);
    }

    //function hasKey(key) {
    //    return lookup(key) !== null;
    //}

    function loadMember() {
        return lookup(keys.MEMBER);
    }

    function saveMember(member) {
        saveToDevice(keys.MEMBER, member);
    }

    function getLocalMember() {
        return localMember;
    }

    function hasLocalMember() {
        return localMember !== null;
    }

    function localMemberName() {
        return hasLocalMember() ? getLocalMember().memberName : null;
    }

    // private methods
    function onMemberCreated(member) {
        // the _id is available here but it is never used by the code
        // the memberName is sufficient to identify a user for now
        // _id could be persisted here if desired
        var memberDto = {
            memberName: member.memberName
            //,_id: member._id
        };
        saveMember(memberDto);
        localMember = memberDto;
    }

    localMember = loadMember();

    Pubsub.subscribe('member.new', onMemberCreated);

    return {
        getLocalMember: getLocalMember,
        hasLocalMember: hasLocalMember,
        localMemberName: localMemberName
    };
});
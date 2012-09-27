// SmartJs v0.1.0
// (c) Hugh Anderson - https://github.com/hughanderson4/smartjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

// the storage module provides an abstraction around the jQuery jstorage lib
// this module returns a static object

define([
    'jstorage',
    'config',
    'util/pubsub'
], function (Storage, Config, Pubsub) {
    
    var keys = {
        MEMBER: 'member'
    };

    function saveToDevice(key, value) {
        Storage.set(Config.storagePrefix + key, value);
    }

    function lookup(key) {
        return Storage.get(Config.storagePrefix + key, null);
    }

    function hasKey(key) {
        return lookup(key) != null;
    }

    function loadMember () {
        return lookup(keys.MEMBER);
    };

    function saveMember (member) {
        saveToDevice(keys.MEMBER, member);
    };

    var localMember = loadMember();

    function getLocalMember() {
        return localMember;
    }

    function hasLocalMember() {
        return localMember != null;
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

    Pubsub.subscribe('member.new', onMemberCreated);

    return {
        getLocalMember: getLocalMember,
        hasLocalMember: hasLocalMember
    };
});
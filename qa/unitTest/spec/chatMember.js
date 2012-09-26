var calledPublish = false;

var serverStub =
    {
        publishGroupEvent: function (eventName, dto) {
            calledPublish = true;
            console.log('stub publishGroupEvent called with ' + eventName);
        }
    };

define("server", [], serverStub);

define(
    [
        "model"
    ],
    function (Model) {


        // Describe the test suite for this module.
        describe(
            "The ChatMember binds to the list of members in chat.",
            function () {

                var memberName = 'test',
                    clientId = '123',
                    isLocalMember = true;

                // Create our test model
                var model = new Model(memberName, clientId, isLocalMember);

                // Test that the model has the correct memberName
                it(
                    "Should have the correct name",
                    function () {
                        expect(model.memberName).toBe(memberName);
                    }
                );

                // Test that the model is a local member
                it(
                    "Should be a local member",
                    function () {
                        expect(model.isLocalMember).toBe(isLocalMember);
                    }
                );

                // Test that the model has a clientId
                it(
                    "Should have a clientId",
                    function () {
                        expect(model.clientId).toBe(clientId);
                    }
                );

                // Test that the model has a isTyping field
                it(
                    "Should have a isTyping field, and not be typing",
                    function () {
                        expect(model.isTyping()).toBe(false);
                    }
                );

                // Test that the model has a isTyping field
                it(
                    "Should update isTyping field by calling setTypingWithoutPublishing",
                    function () {
                        model.setTypingWithoutPublishing(true);
                        expect(model.isTyping()).toBe(true);
                        model.setTypingWithoutPublishing(false);
                        expect(model.isTyping()).toBe(false);
                    }
                );

                // Test that setting the isTyping field publishes a group event
                it(
                    "Should publish a group event when public isTyping is modified",
                    function () {
                        calledPublish = false;
                        model.isTyping(true);
                        expect(calledPublish).toBe(true);
                    }
                );

                // Test that setting the isTyping field publishes a group event
                it(
                    "Should not publish a group event when public isTyping is modified, if not a localMember",
                    function () {
                        model.isLocalMember = false;
                        calledPublish = false;
                        model.isTyping(true);
                        expect(calledPublish).toBe(false);
                    }
                );
            }
        );
    }
);
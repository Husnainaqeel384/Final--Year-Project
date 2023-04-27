import db from "../models/db.js";
import ErrorHandler from "../Error/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js"
//import Status Code
import { StatusCodes } from "http-status-codes"

// Add Members
export const addMembers = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const { memberName } = req.body;
    console.log(memberName)
    const checkUsername = await db('register').where({ UserName: memberName }).select('UserName')
    console.log(checkUsername)
    if (checkUsername.length === 0) {
        return next(new ErrorHandler("Member UserName does not Exist in budget-book", StatusCodes.BAD_REQUEST))
    }
    const checkMember = await db('memberlist').where({ user_id, memberName })
    if (checkMember.length > 0) {
        return next(new ErrorHandler("Member Already Added", StatusCodes.BAD_REQUEST))
    }
    const AddMembers = await db('memberlist').insert({
        user_id,
        memberName
    })
    if (!AddMembers) {
        return next(new ErrorHandler("Member Not Added", StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Member Added Successfully"
    })
})
// Create Group

export const createGroup = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const { GroupName, members } = req.body;

    const checkGroup = await db('billspilttergroup').where({ user_id, GroupName })

    if (checkGroup.length > 0) {
        return next(new ErrorHandler("Group Already Added", StatusCodes.BAD_REQUEST))
    }
    const AddGroup = await db('billspilttergroup').insert({
        user_id,
        GroupName
    })
    if (!AddGroup) {
        return next(new ErrorHandler("Group Not Added", StatusCodes.BAD_REQUEST))
    }
    const billSplitter = await db('billspilttergroup').where({ user_id, GroupName }).select('*')
    const username = await db('register').where({ user_id }).select('UserName')

    // add is of groupName in billSplitter_detail table
    const groupMembers = members.map((member) => ({ billSplitterGroup_id: billSplitter[0].billSplitterGroup_id, user_id, ...member }))
    await db('billsplitter_detail').insert({ billSplitterGroup_id: billSplitter[0].billSplitterGroup_id, user_id, memberName: username[0].UserName })
    const addmembers = await db('billsplitter_detail').insert(
        groupMembers)
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Group Added Successfully"
    })
})

//get all groups
export const AllGroups = catchAsyncError(async (req, res, next) => {

    const user_id = req.user.id;

    const AllGroups = await db('billspilttergroup').where({ user_id }).select('*')
    if (!AllGroups) {
        return next(new ErrorHandler("No Group Created Yet", StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        AllGroups
    })
})

// Delete Group
export const deleteGroup = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const { id } = req.params;
    const deleteGroup = await db('billspilttergroup').where({ user_id, billSplitterGroup_id: id }).delete()
    const deleteMembers = await db('billsplitter_detail').where({ user_id, billSplitterGroup_id: id }).delete()
    const deleteBills = await db('billsplitter_bill_description').where({ billSplitterGroup_id: id }).delete()
    if (!deleteGroup) {
        return next(new ErrorHandler("Group Not Deleted", StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Group Deleted Successfully"
    })
})

// get group by id

export const getGroup = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const { id } = req.params;
    const getGroup = await db('billspilttergroup').where({ user_id, billSplitterGroup_id: id }).select('*')
    if (!getGroup) {
        return next(new ErrorHandler("Group Not Found", StatusCodes.BAD_REQUEST))
    }
    const getMembers = await db('billsplitter_detail').where({ user_id, billSplitterGroup_id: id }).select('*')
    const billsplitterdetailDescription = await db('billsplitter_bill_description').where({ billSplitterGroup_id: id }).select('*').orderBy('date', 'desc')
    res.status(StatusCodes.OK).json({
        success: true,
        getGroup,
        getMembers,
        billsplitterdetailDescription
    })
})

export const getMembersList = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const getMembersList = await db('memberlist').where({ user_id }).select('*')
    if (!getMembersList) {
        return next(new ErrorHandler("No Members Added Yet", StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        getMembersList
    })
})
// bill split functionality
export const billSplit = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const mode = req.body.mode;
    const { bill } = req.body;
    const { billSplitterGroup_id } = req.body;
    const date = new Date();
    const billDate = date.toISOString().slice(0, 10);
    const billTime = date.toTimeString().slice(0, 8);
    const billDateTime = billDate + " " + billTime;
    const billSplitDetail = await db('billsplitter_detail').where({ user_id, billSplitterGroup_id }).select('*')
    if (mode === 'All') {
        // const countMembers = await db('billsplitter_detail')
        //     .where({ user_id, billSplitter_id })
        //     .count('MemberName')

        const count = billSplitDetail.reduce((acc, obj) => obj.user_id === user_id ? acc + 1 : acc, 0)

        // const numMembers = parseInt(countMembers[0])
        const billAmount = parseFloat(bill)
        const splitAmount = billAmount / count;

        billSplitDetail.forEach(async (member) => {
            const selectedMember = await db('billsplitter_detail').where({ user_id, billSplitterGroup_id, MemberName: member.MemberName }).select('*')
            const selectedMemberBill = parseFloat(selectedMember[0].bill)
            const updatedBill = selectedMemberBill + splitAmount
            await db('billsplitter_detail').where({ user_id, billSplitterGroup_id, MemberName: member.MemberName }).update({ bill: updatedBill })
        })
        const userName = await db('register').where({ user_id }).select('UserName')

        const addBill = await db('billsplitter_bill_description').insert({
            billSplitterGroup_id,
            description: ` ${userName[0].UserName} added a bill of ${bill} and split it equally among ${count} members.The Split Amount is ${splitAmount} per person
            `,
            date: billDateTime
        })
        if (!addBill) {
            return next(new ErrorHandler("Bill Not Added", StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Bill Added Successfully"
        })

    }
    else if (mode === '2') {
        const userName = await db('register').where({ user_id }).select('UserName')
        const count = billSplitDetail.reduce((acc, obj) => obj.MemberName === userName[0].UserName ? acc : acc + 1, 0)
        const billAmount = parseFloat(bill)
        const splitAmount = billAmount / count;
        billSplitDetail.forEach(async (member) => {
            if (member.MemberName === userName[0].UserName) {
                const selectedMember = await db('billsplitter_detail').where({ user_id, billSplitterGroup_id, MemberName: member.MemberName }).select('*')
                const selectedMemberBill = parseFloat(selectedMember[0].bill)
                const updatedBill = selectedMemberBill + 0
                await db('billsplitter_detail').where({ user_id, billSplitterGroup_id, MemberName: member.MemberName }).update({ bill: updatedBill })
            }
            else {
                const selectedMember = await db('billsplitter_detail').where({ user_id, billSplitterGroup_id, MemberName: member.MemberName }).select('*')
                const selectedMemberBill = parseFloat(selectedMember[0].bill)
                const updatedBill = selectedMemberBill + splitAmount
                await db('billsplitter_detail').where({ user_id, billSplitterGroup_id, MemberName: member.MemberName }).update({ bill: updatedBill })
            }
        })
        const addBill = await db('billsplitter_bill_description').insert({
            billSplitterGroup_id,
            description: ` Bill Paid by ${userName[0].UserName} is ${bill} and split it equally among ${count} members.The Split Amount is ${splitAmount} per person
            `,
            date: billDateTime
        })
        if (!addBill) {
            return next(new ErrorHandler("Bill Not Added", StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Bill Added Successfully"
        })

    }

})
// clear bill amount
export const clearBillAmount = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const { billSplitterGroup_id } = req.body;
    const ClearBillAmount = req.body.clearbillamount
    const date = new Date();
    const billDate = date.toISOString().slice(0, 10);
    const billTime = date.toTimeString().slice(0, 8);
    const billDateTime = billDate + " " + billTime;
    const userName = await db('register').where({ user_id }).select('UserName')
    const billdetail = await db('billsplitter_detail').where({ user_id, billSplitterGroup_id, MemberName: userName[0].UserName }).select('bill')
    if ((billdetail[0].bill == ClearBillAmount) && (ClearBillAmount > 0)) {
        const updateBillAmount = await db('billsplitter_detail').where({ user_id, billSplitterGroup_id, MemberName: userName[0].UserName }).update({ bill: 0 })
        await db('billsplitter_bill_description').where({ billSplitterGroup_id }).insert({
            billSplitterGroup_id,
            description: ` ${userName[0].UserName} cleared the ${ClearBillAmount} bill amount`,
            date: billDateTime
        })
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Bill Amount Cleared Successfully"
        })
    }
    if (billdetail[0].bill === 0) {
        return next(new ErrorHandler("Bill Amount Already Cleared", StatusCodes.BAD_REQUEST))
    }
    if (ClearBillAmount > billdetail[0].bill) {
        return next(new ErrorHandler("Bill Amount is less than the amount you want to clear", StatusCodes.BAD_REQUEST))
    }
    if (ClearBillAmount < billdetail[0].bill) {
        const updatedBillAmount = billdetail[0].bill - ClearBillAmount
        const updateBillAmount = await db('billsplitter_detail').where({ user_id, billSplitterGroup_id, MemberName: userName[0].UserName }).update({ bill: updatedBillAmount })
        // const clearBillAmount = await db('billsplitter_detail').where({ user_id, billSplitter_id }).update({ bill: 0 })
        if (!updatedBillAmount) {
            return next(new ErrorHandler("Bill Amount Not Cleared", StatusCodes.BAD_REQUEST))
        }
        await db('billsplitter_bill_description').where({ billSplitterGroup_id }).insert({
            billSplitterGroup_id,
            description: ` ${userName[0].UserName} cleared the ${ClearBillAmount} bill amount`,
            date: billDateTime
        })
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Bill Amount Cleared Successfully"
        })
    }


}
)
// delete member from bill splitter
export const deleteMember = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const id = req.params.id;
    const deleteMember = await db('memberlist').where({ user_id, member_id: id }).del()
    if (!deleteMember) {
        return next(new ErrorHandler("Member Not Deleted", StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Member Deleted Successfully"
    })
})
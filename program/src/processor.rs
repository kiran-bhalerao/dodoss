use crate::error::AppError;
use crate::instruction::AppInstruction;
use crate::schema::dodo::Dodo;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_pack::Pack,
    pubkey::Pubkey,
};

pub struct Processor {}

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = AppInstruction::unpack(instruction_data)?;
        match instruction {
            AppInstruction::CreateDodo {
                title,
                content,
                state,
                create_time,
                update_time,
            } => {
                let accounts_iter = &mut accounts.iter();
                let _creator_account = next_account_info(accounts_iter)?;
                let dodo_account = next_account_info(accounts_iter)?;

                if dodo_account.owner != program_id {
                    return Err(AppError::IncorrectProgramId.into());
                }

                // TODO: add creator field to Dodo struct

                let mut data = Dodo::unpack(&dodo_account.data.borrow())?;
                data.title = title;
                data.content = content;
                data.state = state;
                data.create_time = create_time;
                data.update_time = update_time;

                Dodo::pack(data, &mut dodo_account.data.borrow_mut())?;

                Ok(())
            }
            AppInstruction::UpdateDodo { state, update_time } => {
                let accounts_iter = &mut accounts.iter();
                let _creator_account = next_account_info(accounts_iter)?;
                let dodo_account = next_account_info(accounts_iter)?;

                if dodo_account.owner != program_id {
                    return Err(AppError::IncorrectProgramId.into());
                }

                // TODO: get creator from dodo data and check creator is creator

                let mut data = Dodo::unpack(&dodo_account.data.borrow())?;
                data.state = state;
                data.update_time = update_time;

                Dodo::pack(data, &mut dodo_account.data.borrow_mut())?;

                Ok(())
            }
            AppInstruction::RemoveDodo => {
                let accounts_iter = &mut accounts.iter();
                let creator_account = next_account_info(accounts_iter)?;
                let dodo_account = next_account_info(accounts_iter)?;

                let lamports = dodo_account.lamports();

                // transfer all dodo accounts lamports to creator's account
                // TODO: get creator from dodo data

                **dodo_account.try_borrow_mut_lamports()? -= lamports;
                **creator_account.try_borrow_mut_lamports()? += lamports;

                Ok(())
            }
        }
    }
}
